import { createPage, Page } from "../domain/pagination";
import { Videos } from "../domain/video";
import { IAppContext } from "../infra/dependency";
import { AppError, Ok, Result } from "../pkg/errors";

export type BatchUpsertVideosParam = Videos;
export type SearchLiveParam = {};
export type SearchExistParam = {};
export type BatchUpsertByIdsParam = {
  youtubeVideoIds: string[];
  twitchVideoIds: string[];
};
export type ListParam = {
  limit: number;
  page: number;
  platform?: string;
  status?: string;
  videoType?: string;
  startedAt?: Date;
  endedAt?: Date;
};

export type ListResponse = {
  videos: Videos;
  pagination: Page;
};

export type BatchDeleteByVideoIdsParam = {
  videoIds: string[];
};

export interface IVideoInteractor {
  batchUpsert(params: BatchUpsertVideosParam): Promise<Result<Videos, AppError>>;
  searchLive(
    params: SearchLiveParam
  ): Promise<Result<Videos, AppError>>;
  searchExist(
    params: SearchExistParam
  ): Promise<Result<Videos, AppError>>;
  list(params: ListParam): Promise<Result<ListResponse, AppError>>;
  searchDeleted(params: {}): Promise<Result<Videos, AppError>>;
  batchDeleteByVideoIds(
    params: BatchDeleteByVideoIdsParam
  ): Promise<Result<void, AppError>>;
}

export class VideoInteractor implements IVideoInteractor {
  constructor(private readonly context: IAppContext) {}

  // Fetch new videos from external APIs
  async searchLive(
    params: SearchLiveParam
  ): Promise<Result<Videos, AppError>> {
    return this.context.runInTx(async (_repos, services) => {
      const sv = await services.videoService.searchAllLiveVideos();
      if (sv.err) {
        return sv;
      }
      return Ok(sv.val);
    });
  }

  // Fetch videos from database and external APIs
  async searchExist(
    params: SearchExistParam
  ): Promise<Result<Videos, AppError>> {
    return this.context.runInTx(async (_repos, services) => {
      const sv = await services.videoService.searchExistVideos();
      if (sv.err) {
        return sv;
      }
      return Ok(sv.val);
    });
  }

  async batchUpsert(
    params: BatchUpsertVideosParam
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

  async searchDeleted(params: {}): Promise<Result<Videos, AppError>> {
    return this.context.runInTx(async (repos, services) => {
      const sv = await services.videoService.searchDeletedVideos();
      if (sv.err) {
        return sv;
      }

      return Ok(sv.val);
    });
  }

  async batchDeleteByVideoIds(
    params: BatchDeleteByVideoIdsParam
  ): Promise<Result<void, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      const uv = await repos.videoRepository.batchDelete(params.videoIds);
      if (uv.err) {
        return uv;
      }
      return uv;
    });
  }

  }

