import {
  type Creator,
  MemberTypeSchema,
  PlatformSchema,
  StatusSchema,
  type Videos,
} from "..";
import {
  type ITwitcastingService,
  type ITwitchService,
  type IVideoRepository,
  type IYoutubeService,
  query,
} from "../../infra";
import type { IAIService } from "../../infra/ai";
import { withTracerResult } from "../../infra/http/trace/cloudflare";
import type { ICreatorRepository } from "../../infra/repository/creator";
import {
  convertToUTCDate,
  getCurrentUTCDate,
  getCurrentUTCString,
} from "../../pkg/dayjs";
import {
  type AppError,
  Ok,
  type OkResult,
  type Result,
} from "../../pkg/errors";
import { AppLogger } from "../../pkg/logging";
import { TargetLangSchema } from "../translate";

export interface IVideoService {
  searchLiveYoutubeVideos(): Promise<Result<Videos, AppError>>;
  searchLiveTwitchVideos(): Promise<Result<Videos, AppError>>;
  searchLiveTwitCastingVideos(): Promise<Result<Videos, AppError>>;
  searchAllLiveVideos(): Promise<Result<Videos, AppError>>;
  searchExistVideos(): Promise<Result<Videos, AppError>>;
  getVideosByIDs({
    youtubeVideoIds,
    twitchVideoIds,
  }: {
    youtubeVideoIds: string[];
    twitchVideoIds: string[];
  }): Promise<Result<Videos, AppError>>;
  searchDeletedVideos(): Promise<Result<Videos, AppError>>;
  translateVideos({
    languageCode,
    videos,
  }: {
    languageCode: string;
    videos: Videos;
  }): Promise<Result<Videos, AppError>>;
  getVideosByChannel({
    channelId,
    maxResults,
    order,
  }: {
    channelId: string;
    maxResults?: number;
    order?:
      | "date"
      | "rating"
      | "relevance"
      | "title"
      | "videoCount"
      | "viewCount";
  }): Promise<Result<Videos, AppError>>;
  getMemberVideos(): Promise<Result<Videos, AppError>>;
}

export class VideoService implements IVideoService {
  private readonly SERVICE_NAME = "VideoService";

  constructor(
    private readonly deps: {
      youtubeClient: IYoutubeService;
      twitchClient: ITwitchService;
      twitCastingClient: ITwitcastingService;
      creatorRepository: ICreatorRepository;
      videoRepository: IVideoRepository;
      aiService: IAIService;
    },
  ) {}

  async searchLiveYoutubeVideos(): Promise<Result<Videos, AppError>> {
    return withTracerResult(
      this.SERVICE_NAME,
      "searchLiveYoutubeVideos",
      async (span) => {
        AppLogger.info("Searching live YouTube videos", {
          service: this.SERVICE_NAME,
        });

        const c = await this.masterCreators();
        if (c.err) {
          AppLogger.error("Failed to get master creators", {
            service: this.SERVICE_NAME,
            error: c.err,
          });
          return c;
        }

        span.setAttributes({
          creatorCount: c.val.jp.length + c.val.en.length,
        });

        const promises = [
          this.deps.youtubeClient.searchVideos({
            query: query.VSPO_JP,
            eventType: "live",
          }),
          this.deps.youtubeClient.searchVideos({
            query: query.VSPO_EN,
            eventType: "live",
          }),
          this.deps.youtubeClient.searchVideos({
            query: query.VSPO_JP,
            eventType: "upcoming",
          }),
          this.deps.youtubeClient.searchVideos({
            query: query.VSPO_EN,
            eventType: "upcoming",
          }),
        ];

        const results = await Promise.allSettled(promises);
        const videos = results
          .filter(
            (r): r is PromiseFulfilledResult<OkResult<Videos>> =>
              r.status === "fulfilled" && !r.value.err,
          )
          .flatMap((r) => r.value.val);
        const failedResults = results.filter(
          (r): r is PromiseRejectedResult => r.status === "rejected",
        );

        if (failedResults.length > 0) {
          AppLogger.warn("Some YouTube video searches failed", {
            service: this.SERVICE_NAME,
            failedCount: failedResults.length,
            errors: failedResults.map((r) => r.reason),
          });
        }

        AppLogger.info("Successfully fetched Raw YouTube videos", {
          service: this.SERVICE_NAME,
          count: videos.length,
          videoTitles: videos.map((v) => v.title),
        });

        const channelIds = c.val.jp
          .map((c) => c.channel?.youtube?.rawId)
          .concat(c.val.en.map((c) => c.channel?.youtube?.rawId))
          .filter((id) => id !== undefined);

        AppLogger.info("Youtube Channels", {
          service: this.SERVICE_NAME,
          channelIds,
          channelTitles: c.val.jp.map((c) => c.channel?.youtube?.name),
        });

        const videoIds = Array.from(
          new Set(
            videos
              .map((v) => {
                const channelId = v.rawChannelID;
                if (channelIds.includes(channelId)) {
                  return v.rawId;
                }
                return null;
              })
              .filter((id) => id !== null),
          ),
        );

        AppLogger.info("Successfully fetched Filtered YouTube videos", {
          service: this.SERVICE_NAME,
          count: videoIds.length,
          videoTitles: videoIds.map(
            (id) => videos.find((v) => v.rawId === id)?.title,
          ),
        });

        const fetchedVideos = await this.getVideosByIDs({
          youtubeVideoIds: videoIds,
          twitchVideoIds: [],
        });
        if (fetchedVideos.err) {
          AppLogger.error("Failed to fetch videos by IDs", {
            service: this.SERVICE_NAME,
            error: fetchedVideos.err,
          });
          return fetchedVideos;
        }

        AppLogger.info("Successfully fetched YouTube videos", {
          service: this.SERVICE_NAME,
          count: fetchedVideos.val.length,
          videos: fetchedVideos.val.map((v) => ({
            rawId: v.rawId,
            title: v.title,
            status: v.status,
          })),
        });
        return Ok(fetchedVideos.val);
      },
    );
  }

  async searchLiveTwitchVideos(): Promise<Result<Videos, AppError>> {
    AppLogger.info("Searching live Twitch videos", {
      service: this.SERVICE_NAME,
    });

    const c = await this.masterCreators();
    if (c.err) {
      AppLogger.error("Failed to get master creators", {
        service: this.SERVICE_NAME,
        error: c.err,
      });
      return c;
    }

    const userIds = c.val.jp
      .map((c) => c.channel?.twitch?.rawId)
      .concat(c.val.en.map((c) => c.channel?.twitch?.rawId))
      .filter((id) => id !== undefined);

    // Fetch both live streams and archives in parallel
    const results = await Promise.allSettled([
      this.deps.twitchClient.getStreams({ userIds }),
      this.deps.twitchClient.getArchive({ userIds }),
    ]);

    const liveStreams =
      results[0].status === "fulfilled" ? results[0].value.val : [];
    const archives =
      results[1].status === "fulfilled" ? results[1].value.val : [];

    const videos = liveStreams?.concat(archives ?? []);

    if (!videos) {
      return Ok([]);
    }

    const err = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );

    if (err.length > 0) {
      AppLogger.error("Failed to get live streams", {
        service: this.SERVICE_NAME,
        errors: err.map((r) => r.reason),
      });
    }

    const errLive =
      results[0].status === "fulfilled" ? results[0].value.err : null;
    const errArchive =
      results[1].status === "fulfilled" ? results[1].value.err : null;

    if (errLive) {
      AppLogger.error("Failed to get live streams", {
        service: this.SERVICE_NAME,
        error: errLive,
      });
    }

    if (errArchive) {
      AppLogger.error("Failed to get archive", {
        service: this.SERVICE_NAME,
        error: errArchive,
      });
    }

    // Get the current live stream IDs to check against existing videos
    const ids = new Set(videos.map((video) => video.rawId));
    // Get existing videos that are marked as live from Twitch
    const existingLiveVideosResult = await this.deps.videoRepository.list({
      limit: 500,
      page: 0,
      status: StatusSchema.Enum.live,
      platform: PlatformSchema.Enum.twitch,
      languageCode: "default",
      orderBy: "desc",
    });

    // Process ended videos in parallel with other operations
    if (
      !existingLiveVideosResult.err &&
      existingLiveVideosResult.val.length > 0
    ) {
      const endedVideoIds = existingLiveVideosResult.val
        .filter((video) => !ids.has(video.rawId))
        .map((video) => video.id);

      // Delete videos that are no longer live
      if (endedVideoIds.length > 0) {
        AppLogger.info(
          `Deleting ${endedVideoIds.length} Twitch videos that have ended`,
          {
            service: this.SERVICE_NAME,
            endedVideoIds: endedVideoIds,
            streamIds: ids,
          },
        );
        // Delete videos that have ended using batchDelete (don't await here)
        await this.deps.videoRepository.batchDelete(endedVideoIds);
      }
    }

    AppLogger.info("Successfully fetched Twitch videos", {
      service: this.SERVICE_NAME,
      count: videos.length,
    });
    return Ok(videos);
  }

  async searchLiveTwitCastingVideos(): Promise<Result<Videos, AppError>> {
    AppLogger.info("Searching live TwitCasting videos", {
      service: this.SERVICE_NAME,
    });

    const c = await this.masterCreators();
    if (c.err) {
      AppLogger.error("Failed to get master creators", {
        service: this.SERVICE_NAME,
        error: c.err,
      });
      return c;
    }

    const userIds = c.val.jp
      .map((c) => c.channel?.twitCasting?.rawId)
      .concat(c.val.en.map((c) => c.channel?.twitCasting?.rawId))
      .filter((id) => id !== undefined);

    const result = await this.deps.twitCastingClient.getVideos({
      userIds: userIds,
    });
    if (result.err) {
      AppLogger.error("Failed to get TwitCasting videos", {
        service: this.SERVICE_NAME,
        error: result.err,
      });
      return result;
    }

    AppLogger.info("Successfully fetched TwitCasting videos", {
      service: this.SERVICE_NAME,
      count: result.val.length,
    });
    return Ok(result.val);
  }

  async searchAllLiveVideos(): Promise<Result<Videos, AppError>> {
    AppLogger.info("Searching all live videos", {
      service: this.SERVICE_NAME,
    });

    const results = await Promise.allSettled([
      this.searchLiveYoutubeVideos(),
      this.searchLiveTwitchVideos(),
      this.searchLiveTwitCastingVideos(),
    ]);

    const videos = results
      .filter(
        (r): r is PromiseFulfilledResult<OkResult<Videos>> =>
          r.status === "fulfilled" && !r.value.err,
      )
      .flatMap((r) => r.value.val);

    const failedResults = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );

    if (failedResults.length > 0) {
      AppLogger.warn("Some video searches failed", {
        service: this.SERVICE_NAME,
        failedCount: failedResults.length,
        errors: failedResults.map((r) => r.reason),
      });
    }

    AppLogger.info("Successfully fetched all live videos", {
      service: this.SERVICE_NAME,
      count: videos.length,
      videos: videos.map((v) => ({
        rawId: v.rawId,
        title: v.title,
        status: v.status,
      })),
    });
    return Ok(videos);
  }

  // Get videos that have differences from existing videos
  async searchExistVideos(): Promise<Result<Videos, AppError>> {
    const liveVideos = await this.deps.videoRepository.list({
      limit: 1000,
      page: 0,
      status: StatusSchema.Enum.live,
      startedAt: convertToUTCDate(
        getCurrentUTCDate().setDate(getCurrentUTCDate().getDate() - 1),
      ),
      languageCode: "default",
      orderBy: "desc",
    });
    const upcomingVideos = await this.deps.videoRepository.list({
      limit: 1000,
      page: 0,
      status: StatusSchema.Enum.upcoming,
      startedAt: convertToUTCDate(
        getCurrentUTCDate().setDate(getCurrentUTCDate().getDate() - 1),
      ),
      languageCode: "default",
      orderBy: "desc",
    });
    if (liveVideos.err) {
      return liveVideos;
    }
    if (upcomingVideos.err) {
      return upcomingVideos;
    }

    const existingVideos = liveVideos.val.concat(upcomingVideos.val);
    const youtubeVideoIds = existingVideos
      .filter((v) => v.platform === PlatformSchema.Enum.youtube)
      .map((v) => v.rawId);

    const twitchVideoIds = existingVideos
      .filter((v) => v.platform === PlatformSchema.Enum.twitch)
      .map((v) => v.rawId);

    const fetchedVideos = await this.getVideosByIDs({
      youtubeVideoIds,
      twitchVideoIds,
    });

    if (fetchedVideos.err) {
      return fetchedVideos;
    }

    AppLogger.debug("Successfully fetched videos", {
      service: this.SERVICE_NAME,
      count: fetchedVideos.val.length,
      videos: fetchedVideos.val.map((v) => ({
        rawId: v.rawId,
        title: v.title,
        status: v.status,
      })),
    });

    const diff = this.getVideoDifferences(fetchedVideos.val, existingVideos);

    AppLogger.debug("Successfully fetched videos", {
      service: this.SERVICE_NAME,
      count: diff.length,
      videos: diff.map((v) => ({
        rawId: v.rawId,
        title: v.title,
        status: v.status,
      })),
    });

    return Ok(diff);
  }

  async searchDeletedVideos(): Promise<Result<Videos, AppError>> {
    const existingVideos = await this.deps.videoRepository.list({
      limit: 500,
      page: 0,
      platform: PlatformSchema.Enum.youtube,
      languageCode: "default",
      orderBy: "desc",
    });
    if (existingVideos.err) {
      return existingVideos;
    }

    const youtubeVideoIds = existingVideos.val
      .filter((v) => v.platform === PlatformSchema.Enum.youtube)
      .map((v) => v.rawId);

    const ytFetchedVideos = await this.getVideosByIDs({
      youtubeVideoIds,
      twitchVideoIds: [],
    });

    if (ytFetchedVideos.err) {
      return ytFetchedVideos;
    }

    // const existTwitchVideos = existingVideos.val.filter(
    //   (v) => v.platform === PlatformSchema.Enum.twitch,
    // );

    // const liveTwitchVideos = await this.searchLiveTwitchVideos();
    // if (liveTwitchVideos.err) {
    //   return liveTwitchVideos;
    // }

    // const liveTwitchVideoIds = liveTwitchVideos.val
    //   .filter((v) => v.platform === PlatformSchema.Enum.twitch)
    //   .map((v) => v.rawId);

    // const deletedTwitchVideos = existTwitchVideos.filter(
    //   (v) => !liveTwitchVideoIds.includes(v.rawId),
    // );

    const deletedYtVideos = existingVideos.val.filter(
      (v) => !ytFetchedVideos.val.find((fv) => fv.rawId === v.rawId),
    );

    const deletedVideos = deletedYtVideos;

    AppLogger.info("Successfully fetched deleted videos", {
      service: this.SERVICE_NAME,
      count: deletedVideos.length,
      videos: deletedVideos.map((v) => ({
        rawId: v.rawId,
        title: v.title,
        status: v.status,
      })),
    });

    return Ok(
      deletedVideos.map((video) => ({
        ...video,
        deleted: true,
      })),
    );
  }

  async getVideosByIDs({
    youtubeVideoIds,
    twitchVideoIds,
  }: {
    youtubeVideoIds: string[];
    twitchVideoIds: string[];
  }): Promise<Result<Videos, AppError>> {
    const results: PromiseSettledResult<Result<Videos, AppError>>[] =
      await Promise.allSettled([
        ...(youtubeVideoIds.length > 0
          ? [this.deps.youtubeClient.getVideos({ videoIds: youtubeVideoIds })]
          : []),
        ...(twitchVideoIds.length > 0
          ? [
              this.deps.twitchClient.getVideosByIDs({
                videoIds: twitchVideoIds,
              }),
            ]
          : []),
      ]);
    const videos = results
      .filter(
        (r): r is PromiseFulfilledResult<OkResult<Videos>> =>
          r.status === "fulfilled" && !r.value.err,
      )
      .flatMap((r) => r.value.val);

    return Ok(videos);
  }

  async translateVideos({
    languageCode,
    videos,
  }: {
    languageCode: string;
    videos: Videos;
  }): Promise<Result<Videos, AppError>> {
    AppLogger.info("Translating videos", {
      service: this.SERVICE_NAME,
      languageCode,
      videoCount: videos.length,
    });

    const translatePromises = videos.map((video) =>
      this.deps.aiService.translateText(video.title, languageCode),
    );
    const translatedResults = await Promise.allSettled(translatePromises);
    const translatedVideos = videos.map((video, i) => {
      const translatedText =
        translatedResults[i].status === "fulfilled"
          ? (translatedResults[i].value.val?.translatedText ?? video.title)
          : video.title;
      return {
        ...video,
        title: translatedText,
        languageCode: TargetLangSchema.parse(languageCode),
      };
    });

    AppLogger.info("Successfully translated videos", {
      service: this.SERVICE_NAME,
      count: translatedVideos.length,
    });
    return Ok(translatedVideos);
  }

  async getMemberVideos(): Promise<Result<Videos, AppError>> {
    // Check if the channel exists in our creators
    const creators = await this.masterCreators();
    if (creators.err) {
      AppLogger.error("Failed to get master creators", {
        service: this.SERVICE_NAME,
        error: creators.err,
      });
      return creators;
    }
    const channelIds = creators.val.jp
      .map((c) => c.channel?.youtube?.rawId)
      .concat(creators.val.en.map((c) => c.channel?.youtube?.rawId))
      .filter((id) => id !== undefined);

    const existingLiveVideos = await this.deps.videoRepository.list({
      limit: 500,
      page: 0,
      languageCode: "default",
      status: StatusSchema.Enum.live,
      channelIds: channelIds,
      orderBy: "desc",
    });
    if (existingLiveVideos.err) {
      return existingLiveVideos;
    }

    const existingVideos = existingLiveVideos.val;

    const promises = channelIds.map((id) =>
      this.getVideosByChannel({ channelId: id, maxResults: 5 }),
    );
    const results = await Promise.allSettled(promises);
    const videos = results
      .filter(
        (r): r is PromiseFulfilledResult<OkResult<Videos>> =>
          r.status === "fulfilled" && !r.value.err,
      )
      .flatMap((r) => r.value.val);

    const videosWithDiff = this.getVideoDifferences(videos, existingVideos);

    AppLogger.info("Successfully fetched member videos", {
      service: this.SERVICE_NAME,
      count: videosWithDiff.length,
      videos: videosWithDiff.map((v) => ({
        rawId: v.rawId,
        title: v.title,
        status: v.status,
      })),
    });
    return Ok(videosWithDiff);
  }

  async getVideosByChannel({
    channelId,
    maxResults,
    order,
    eventType,
  }: {
    channelId: string;
    maxResults?: number;
    order?:
      | "date"
      | "rating"
      | "relevance"
      | "title"
      | "videoCount"
      | "viewCount";
    eventType?: "completed" | "live" | "upcoming";
  }): Promise<Result<Videos, AppError>> {
    return withTracerResult(
      this.SERVICE_NAME,
      "getVideosByChannel",
      async (span) => {
        AppLogger.info("Fetching videos by channel ID", {
          service: this.SERVICE_NAME,
          channelId,
        });

        // Fetch videos from the channel
        const result = await this.deps.youtubeClient.getVideosByChannel({
          channelId,
          maxResults,
          order,
          eventType,
        });

        if (result.err) {
          AppLogger.error("Failed to fetch videos by channel", {
            service: this.SERVICE_NAME,
            channelId,
            error: result.err,
          });
          return result;
        }

        const yt = await this.deps.youtubeClient.getVideos({
          videoIds: result.val.map((v) => v.rawId),
        });

        if (yt.err) {
          return yt;
        }

        AppLogger.info("Successfully fetched videos by channel", {
          service: this.SERVICE_NAME,
          channelId,
          count: yt.val.length,
          videos: yt.val.map((v) => ({
            rawId: v.rawId,
            title: v.title,
            status: v.status,
          })),
        });

        return Ok(yt.val);
      },
    );
  }

  private async masterCreators(): Promise<
    Result<{ jp: Creator[]; en: Creator[] }, AppError>
  > {
    const jpCreators = await this.deps.creatorRepository.list({
      limit: 300,
      page: 0,
      memberType: MemberTypeSchema.Enum.vspo_jp,
      languageCode: "default",
    });
    if (jpCreators.err) {
      return jpCreators;
    }

    const enCreators = await this.deps.creatorRepository.list({
      limit: 300,
      page: 0,
      memberType: MemberTypeSchema.Enum.vspo_en,
      languageCode: "default",
    });
    if (enCreators.err) {
      return enCreators;
    }

    return Ok({ jp: jpCreators.val, en: enCreators.val });
  }

  private getVideoDifferences(
    fetchedVideos: Videos,
    existingVideos: Videos,
  ): Videos {
    return fetchedVideos.filter((fetchedVideo) => {
      const existingVideo = existingVideos.find(
        (v) => v.rawId === fetchedVideo.rawId,
      );
      if (!existingVideo) return true;
      return (
        existingVideo.title !== fetchedVideo.title ||
        existingVideo.status !== fetchedVideo.status ||
        existingVideo.description !== fetchedVideo.description ||
        existingVideo.startedAt !== fetchedVideo.startedAt ||
        existingVideo.endedAt !== fetchedVideo.endedAt
      );
    });
  }
}
