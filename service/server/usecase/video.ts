import { type Page, createPage } from "../domain/pagination";
import type { Videos } from "../domain/video";
import type { IAppContext } from "../infra/dependency";
import { withTracerResult } from "../infra/http/trace";
import { type AppError, Ok, type Result } from "../pkg/errors";
import { AppLogger } from "../pkg/logging";

export type BatchUpsertVideosParam = Videos;
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
  memberType?: string;
  startedAt?: Date;
  endedAt?: Date;
  languageCode: string;
  orderBy?: "asc" | "desc";
};

export type ListResponse = {
  videos: Videos;
  pagination: Page;
};

export type BatchDeleteByVideoIdsParam = {
  videoIds: string[];
};

export type TranslateVideoParam = {
  languageCode: string;
  videos: Videos;
};

export interface IVideoInteractor {
  batchUpsert(
    params: BatchUpsertVideosParam,
  ): Promise<Result<Videos, AppError>>;
  searchLive(): Promise<Result<Videos, AppError>>;
  searchExist(): Promise<Result<Videos, AppError>>;
  list(params: ListParam): Promise<Result<ListResponse, AppError>>;
  searchDeletedCheck(): Promise<Result<Videos, AppError>>;
  batchDeleteByVideoIds(
    params: BatchDeleteByVideoIdsParam,
  ): Promise<Result<void, AppError>>;
  translateVideo(
    params: TranslateVideoParam,
  ): Promise<Result<Videos, AppError>>;
  getMemberVideos(): Promise<Result<Videos, AppError>>;
  deletedListIds(): Promise<Result<string[], AppError>>;
}

export class VideoInteractor implements IVideoInteractor {
  constructor(private readonly context: IAppContext) {}

  // Fetch new videos from external APIs
  async searchLive(): Promise<Result<Videos, AppError>> {
    return await withTracerResult("VideoInteractor", "searchLive", async () => {
      return this.context.runInTx(async (_repos, services) => {
        const sv = await services.videoService.searchAllLiveVideos();
        if (sv.err) {
          return sv;
        }
        return Ok(sv.val);
      });
    });
  }

  // Fetch videos from database and external APIs
  async searchExist(): Promise<Result<Videos, AppError>> {
    return await withTracerResult(
      "VideoInteractor",
      "searchExist",
      async () => {
        return this.context.runInTx(async (_repos, services) => {
          const sv = await services.videoService.searchExistVideos();
          if (sv.err) {
            return sv;
          }
          return Ok(sv.val);
        });
      },
    );
  }

  async batchUpsert(
    params: BatchUpsertVideosParam,
  ): Promise<Result<Videos, AppError>> {
    return await withTracerResult(
      "VideoInteractor",
      "batchUpsert",
      async () => {
        return this.context.runInTx(async (repos, _services) => {
          const uv = await repos.videoRepository.batchUpsert(params);
          if (uv.err) {
            return uv;
          }
          return Ok(uv.val);
        });
      },
    );
  }

  async list(params: ListParam): Promise<Result<ListResponse, AppError>> {
    return await withTracerResult("VideoInteractor", "list", async () => {
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
    });
  }

  async searchDeletedCheck(): Promise<Result<Videos, AppError>> {
    return await withTracerResult(
      "VideoInteractor",
      "searchDeletedCheck",
      async () => {
        return this.context.runInTx(async (repos, services) => {
          const sv = await services.videoService.searchDeletedVideos();
          if (sv.err) {
            return sv;
          }

          return Ok(sv.val);
        });
      },
    );
  }

  async batchDeleteByVideoIds(
    params: BatchDeleteByVideoIdsParam,
  ): Promise<Result<void, AppError>> {
    return await withTracerResult(
      "VideoInteractor",
      "batchDeleteByVideoIds",
      async () => {
        return this.context.runInTx(async (repos, _services) => {
          const uv = await repos.videoRepository.batchDelete(params.videoIds);
          if (uv.err) {
            return uv;
          }
          return uv;
        });
      },
    );
  }

  async translateVideo(
    params: TranslateVideoParam,
  ): Promise<Result<Videos, AppError>> {
    return await withTracerResult(
      "VideoInteractor",
      "translateVideo",
      async () => {
        return this.context.runInTx(async (_repos, services) => {
          const sv = await services.videoService.translateVideos(params);
          if (sv.err) {
            return sv;
          }
          return Ok(sv.val);
        });
      },
    );
  }

  async getMemberVideos(): Promise<Result<Videos, AppError>> {
    return await withTracerResult(
      "VideoInteractor",
      "getMemberVideos",
      async () => {
        return this.context.runInTx(async (_repos, services) => {
          const sv = await services.videoService.getMemberVideos();
          if (sv.err) {
            return sv;
          }
          return Ok(sv.val);
        });
      },
    );
  }

  async deletedListIds(): Promise<Result<string[], AppError>> {
    return await withTracerResult(
      "VideoInteractor",
      "deletedListIds",
      async () => {
        return this.context.runInTx(async (repos, _services) => {
          const sv = await repos.videoRepository.deletedListIds();
          if (sv.err) {
            return sv;
          }
          AppLogger.info("deletedListIds", {
            videoIds: sv.val,
          });
          return Ok(sv.val);
        });
      },
    );
  }
}
