import { createPage, Page } from "../domain/pagination";
import { Videos } from "../domain/video";
import { IAppContext } from "../infra/dependency";
import { AppError, Ok, Result } from "../pkg/errors";

type BatchUpsertParam = Videos;
type BatchUpsertBySearchLiveParam = {};
type BatchUpsertBySearchExistParam = {};
type BatchUpsertByIdsParam = {
  youtubeVideoIds: string[];
  twitchVideoIds: string[];
};
type ListParam = {
  limit: number;
  page: number;
  platform?: string;
  status?: string;
  videoType?: string;
  startedAt?: Date;
  endedAt?: Date;
};

type ListResponse = {
  videos: Videos;
  pagination: Page;
};

interface IVideoInteractor {
  batchUpsert(params: BatchUpsertParam): Promise<Result<Videos, AppError>>;
  batchUpsertBySearchLive(
    params: BatchUpsertBySearchLiveParam
  ): Promise<Result<Videos, AppError>>;
  batchUpsertBySearchExist(
    params: BatchUpsertBySearchExistParam
  ): Promise<Result<Videos, AppError>>;
  batchUpsertByIds(
    params: BatchUpsertByIdsParam
  ): Promise<Result<Videos, AppError>>;
  list(params: ListParam): Promise<Result<ListResponse, AppError>>;
}

export class VideoInteractor implements IVideoInteractor {
  constructor(private readonly context: IAppContext) {}

  // Fetch new videos from external APIs
  async batchUpsertBySearchLive(
    params: BatchUpsertBySearchLiveParam
  ): Promise<Result<Videos, AppError>> {
    return this.context.runInTx(async (_repos, services) => {
      const sv = await services.videoService.searchAllLiveVideos();
      if (sv.err) {
        return sv;
      }

      // const uv = await this.videoRepository.batchUpsert(sv.val)
      // if (uv.err) {
      //     return uv
      // }
      return Ok(sv.val);
    });
  }

  // Fetch videos from database and external APIs
  async batchUpsertBySearchExist(
    params: BatchUpsertBySearchExistParam
  ): Promise<Result<Videos, AppError>> {
    return this.context.runInTx(async (_repos, services) => {
      const sv = await services.videoService.searchExistVideos();
      if (sv.err) {
        return sv;
      }

      // const uv = await this.videoRepository.batchUpsert(sv.val)
      // if (uv.err) {
      //     return uv
      // }
      return Ok(sv.val);
    });
  }

  async batchUpsertByIds(
    params: BatchUpsertByIdsParam
  ): Promise<Result<Videos, AppError>> {
    return this.context.runInTx(async (repos, services) => {
      const sv = await services.videoService.getVideosByIDs({
        youtubeVideoIds: params.youtubeVideoIds,
        twitchVideoIds: params.twitchVideoIds,
      });
      if (sv.err) {
        return sv;
      }

      const uv = await repos.videoRepository.batchUpsert(sv.val);
      if (uv.err) {
        return uv;
      }
      return Ok(uv.val);
    });
  }

  async batchUpsert(
    params: BatchUpsertParam
  ): Promise<Result<Videos, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      const uv = await repos.videoRepository.batchUpsert(params);
      if (uv.err) {
        return uv;
      }
      return Ok(uv.val);
    });
  }

  async list(params: ListParam): Promise<Result<ListResponse, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      const sv = await repos.videoRepository.list(params);
      if (sv.err) {
        return sv;
      }

      const c = await repos.videoRepository.count(params);
      if (c.err) {
        return c;
      }
      return Ok({
        videos: sv.val,
        pagination: createPage({
          currentPage: params.page,
          limit: params.limit,
          totalCount: c.val,
        }),
      });
    });
  }
}
