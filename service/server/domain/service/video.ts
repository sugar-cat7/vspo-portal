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
import type { ICreatorRepository } from "../../infra/repository/creator";
import {
  type AppError,
  Ok,
  type OkResult,
  type Result,
} from "../../pkg/errors";
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
}

export class VideoService implements IVideoService {
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
    const c = await this.masterCreators();
    if (c.err) {
      return c;
    }
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
      console.error(
        "Failed to fetch some YouTube videos:",
        failedResults.map((r) => r.reason),
      );
    }

    const channelIds = c.val.jp
      .map((c) => c.channel?.youtube?.rawId)
      .concat(c.val.en.map((c) => c.channel?.youtube?.rawId))
      .filter((id) => id !== undefined);

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

    const fetchedVideos = await this.getVideosByIDs({
      youtubeVideoIds: videoIds,
      twitchVideoIds: [],
    });
    if (fetchedVideos.err) {
      return fetchedVideos;
    }
    return Ok(fetchedVideos.val);
  }

  async searchLiveTwitchVideos(): Promise<Result<Videos, AppError>> {
    const c = await this.masterCreators();
    if (c.err) {
      return c;
    }

    const userIds = c.val.jp
      .map((c) => c.channel?.twitch?.rawId)
      .concat(c.val.en.map((c) => c.channel?.twitch?.rawId))
      .filter((id) => id !== undefined);
    const result = await this.deps.twitchClient.getStreams({
      userIds: userIds,
    });
    if (result.err) {
      return result;
    }
    return Ok(result.val);
  }

  async searchLiveTwitCastingVideos(): Promise<Result<Videos, AppError>> {
    const c = await this.masterCreators();
    if (c.err) {
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
      return result;
    }

    return Ok(result.val);
  }

  async searchAllLiveVideos(): Promise<Result<Videos, AppError>> {
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

    return Ok(videos);
  }

  // Get videos that have differences from existing videos
  async searchExistVideos(): Promise<Result<Videos, AppError>> {
    const liveVideos = await this.deps.videoRepository.list({
      limit: 30,
      page: 0,
      status: StatusSchema.Enum.live,
      languageCode: "default",
    });
    const upcomingVideos = await this.deps.videoRepository.list({
      limit: 30,
      page: 0,
      status: StatusSchema.Enum.upcoming,
      languageCode: "default",
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

    return Ok(this.getVideoDifferences(fetchedVideos.val, existingVideos));
  }

  async searchDeletedVideos(): Promise<Result<Videos, AppError>> {
    const existingVideos = await this.deps.videoRepository.list({
      limit: 100,
      page: 0,
      languageCode: "default",
    });
    if (existingVideos.err) {
      return existingVideos;
    }

    const youtubeVideoIds = existingVideos.val
      .filter((v) => v.platform === PlatformSchema.Enum.youtube)
      .map((v) => v.rawId);

    const twitchVideoIds = existingVideos.val
      .filter((v) => v.platform === PlatformSchema.Enum.twitch)
      .map((v) => v.rawId);

    const fetchedVideos = await this.getVideosByIDs({
      youtubeVideoIds,
      twitchVideoIds,
    });

    if (fetchedVideos.err) {
      return fetchedVideos;
    }

    const deletedVideos = existingVideos.val.filter(
      (v) => !fetchedVideos.val.find((fv) => fv.rawId === v.rawId),
    );
    return Ok(deletedVideos);
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

    return Ok(translatedVideos);
  }

  private async masterCreators(): Promise<
    Result<{ jp: Creator[]; en: Creator[] }, AppError>
  > {
    const jpCreators = await this.deps.creatorRepository.list({
      limit: 50,
      page: 0,
      memberType: MemberTypeSchema.Enum.vspo_jp,
    });
    if (jpCreators.err) {
      return jpCreators;
    }

    const enCreators = await this.deps.creatorRepository.list({
      limit: 50,
      page: 0,
      memberType: MemberTypeSchema.Enum.vspo_en,
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
