import { Creator, MemberTypeSchema, PlatformSchema, StatusSchema, Videos } from "..";
import { IYoutubeService, ITwitchService, ITwitcastingService, query, IVideoRepository } from "../../infra";
import { ICreatorRepository } from "../../infra/repository/creator";
import { AppError, Result, Ok, OkResult } from "../../pkg/errors";

export interface IVideoService {
    searchLiveYoutubeVideos(): Promise<Result<Videos, AppError>>;
    searchLiveTwitchVideos(): Promise<Result<Videos, AppError>>;
    searchLiveTwitCastingVideos(): Promise<Result<Videos, AppError>>;
    searchAllLiveVideos(): Promise<Result<Videos, AppError>>;
    searchExistVideos(): Promise<Result<Videos, AppError>>;
    getVideosByIDs({ youtubeVideoIds, twitchVideoIds }: { youtubeVideoIds: string[], twitchVideoIds: string[] }): Promise<Result<Videos, AppError>>;
    searchDeletedVideoIds(): Promise<Result<{ videoIds: string[] }, AppError>>;
}

export class VideoService implements IVideoService {
  constructor(
    private readonly deps: {
      youtubeClient: IYoutubeService;
      twitchClient: ITwitchService;
      twitCastingClient: ITwitcastingService;
      creatorRepository: ICreatorRepository;
      videoRepository: IVideoRepository;
    }
  ) {}

  async searchLiveYoutubeVideos(): Promise<Result<Videos, AppError>> {
    const promises = [
      this.deps.youtubeClient.searchVideos({ query: query.VSPO_JP, eventType: "live" }),
      this.deps.youtubeClient.searchVideos({ query: query.VSPO_EN, eventType: "live" }),
      this.deps.youtubeClient.searchVideos({ query: query.VSPO_JP, eventType: "upcoming" }),
      this.deps.youtubeClient.searchVideos({ query: query.VSPO_EN, eventType: "upcoming" }),
    ];

    const results = await Promise.allSettled(promises);

    const videos = results.filter(
      (r): r is PromiseFulfilledResult<OkResult<Videos>> => 
        r.status === "fulfilled" && !r.value.err
    ).flatMap((r) => r.value.val)

    const fetchedVideos = await this.getVideosByIDs({ youtubeVideoIds: videos.map(v => v.id), twitchVideoIds: [] });
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

        const userIds = c.val.jp.map(c => c.channel?.twitch?.rawId)
            .concat(c.val.en.map(c => c.channel?.twitch?.rawId))
            .filter(id => id !== undefined)
        
        const result = await this.deps.twitchClient.getStreams({ userIds: userIds });
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

        const userIds = c.val.jp.map(c => c.channel?.twitCasting?.rawId)
            .concat(c.val.en.map(c => c.channel?.twitCasting?.rawId))
            .filter(id => id !== undefined)
        
        const result = await this.deps.twitCastingClient.getVideos({ userIds: userIds });
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
  
      const videos = results.filter(
        (r): r is PromiseFulfilledResult<OkResult<Videos>> => 
          r.status === "fulfilled" && !r.value.err
      ).flatMap((r) => r.value.val)
  
      return Ok(videos);
  }

  // Get videos that have differences from existing videos
  async searchExistVideos(): Promise<Result<Videos, AppError>> {
    const liveVideos = await this.deps.videoRepository.list({ limit: 30, page: 0, status: StatusSchema.Enum.live });
    const upcomingVideos = await this.deps.videoRepository.list({ limit: 30, page: 0, status: StatusSchema.Enum.upcoming });

    if (liveVideos.err) {
        return liveVideos;
    }
    if (upcomingVideos.err) {
        return upcomingVideos;
    }

    const existingVideos = liveVideos.val.concat(upcomingVideos.val);

    const youtubeVideoIds = existingVideos
        .filter(v => v.platform === PlatformSchema.Enum.youtube)
        .map(v => v.id);

    const twitchVideoIds = existingVideos
        .filter(v => v.platform === PlatformSchema.Enum.twitch)
        .map(v => v.id);

    const fetchedVideos = await this.getVideosByIDs({ youtubeVideoIds, twitchVideoIds });

    if (fetchedVideos.err) {
        return fetchedVideos;
    }

    return Ok(this.getVideoDifferences(fetchedVideos.val, existingVideos));
}

  async searchDeletedVideoIds(): Promise<Result<{ videoIds: string[] }, AppError>> {
    const existingVideos = await this.deps.videoRepository.list({ limit: 100, page: 0 });
    if (existingVideos.err) {
        return existingVideos;
    }

    const youtubeVideoIds = existingVideos.val
        .filter(v => v.platform === PlatformSchema.Enum.youtube)
        .map(v => v.id);

    const twitchVideoIds = existingVideos.val
        .filter(v => v.platform === PlatformSchema.Enum.twitch)
        .map(v => v.id);

    const fetchedVideos = await this.getVideosByIDs({ youtubeVideoIds, twitchVideoIds });

    if (fetchedVideos.err) {
        return fetchedVideos;
    }

    const deletedVideoIds = existingVideos.val
        .filter(v => !fetchedVideos.val.find(fetchedVideo => fetchedVideo.id === v.id))
        .map(v => v.id);

    return Ok({ videoIds: deletedVideoIds });
  }

   async getVideosByIDs({ youtubeVideoIds, twitchVideoIds }: { youtubeVideoIds: string[], twitchVideoIds: string[] }): Promise<Result<Videos, AppError>> {
    const results: PromiseSettledResult<Result<Videos, AppError>>[] = await Promise.allSettled([
      ...(youtubeVideoIds.length > 0
        ? [this.deps.youtubeClient.getVideos({ videoIds: youtubeVideoIds })]
        : []),
      ...(twitchVideoIds.length > 0
        ? [this.deps.twitchClient.getVideosByIDs({ videoIds: twitchVideoIds })]
        : []),
    ]);

      const videos = results.filter(
        (r): r is PromiseFulfilledResult<OkResult<Videos>> => 
          r.status === "fulfilled" && !r.value.err
      ).flatMap((r) => r.value.val)

      return Ok(videos);
   }

    private async masterCreators(): Promise<Result<{ jp: Creator[]; en: Creator[] }, AppError>> {
      const jpCreators = await this.deps.creatorRepository.list({ limit: 50, page: 0, memberType: MemberTypeSchema.Enum.vspo_jp });
      if (jpCreators.err) {
          return jpCreators;
      }
  
      const enCreators = await this.deps.creatorRepository.list({ limit: 50, page: 0, memberType: MemberTypeSchema.Enum.vspo_en });
      if (enCreators.err) {
          return enCreators;
      }
  
      return Ok({ jp: jpCreators.val, en: enCreators.val });
  }

  private getVideoDifferences(fetchedVideos: Videos, existingVideos: Videos): Videos {
    return fetchedVideos.filter(fetchedVideo => {
        const existingVideo = existingVideos.find(v => v.id === fetchedVideo.id);
        if (!existingVideo) return true;

        return (
            existingVideo.title !== fetchedVideo.title ||
            existingVideo.status !== fetchedVideo.status ||
            existingVideo.description !== fetchedVideo.description ||
            existingVideo.startedAt?.getTime() !== fetchedVideo.startedAt?.getTime() ||
            existingVideo.endedAt?.getTime() !== fetchedVideo.endedAt?.getTime()
        );
    });
}
  
}
