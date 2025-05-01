import { type Page, createPage } from "../domain/pagination";
import type { Streams } from "../domain/stream";
import type { IAppContext } from "../infra/dependency";
import { withTracerResult } from "../infra/http/trace";
import { type AppError, Ok, type Result } from "../pkg/errors";
import { AppLogger } from "../pkg/logging";

export type BatchUpsertStreamsParam = Streams;
export type BatchUpsertByIdsParam = {
  youtubeStreamIds: string[];
  twitchStreamIds: string[];
};
export type ListParam = {
  limit: number;
  page: number;
  platform?: string;
  status?: string;
  memberType?: string;
  startedAt?: Date;
  endedAt?: Date;
  languageCode: string;
  orderBy?: "asc" | "desc";
};

export type ListResponse = {
  streams: Streams;
  pagination: Page;
};

export type BatchDeleteByStreamIdsParam = {
  streamIds: string[];
};

export type TranslateStreamParam = {
  languageCode: string;
  streams: Streams;
};

export type SearchByStreamIdsAndCreateParam = {
  streamIds: string[];
};

export interface IStreamInteractor {
  batchUpsert(
    params: BatchUpsertStreamsParam,
  ): Promise<Result<Streams, AppError>>;
  searchLive(): Promise<Result<Streams, AppError>>;
  searchExist(): Promise<Result<Streams, AppError>>;
  list(params: ListParam): Promise<Result<ListResponse, AppError>>;
  searchDeletedCheck(): Promise<Result<Streams, AppError>>;
  batchDeleteByStreamIds(
    params: BatchDeleteByStreamIdsParam,
  ): Promise<Result<void, AppError>>;
  translateStream(
    params: TranslateStreamParam,
  ): Promise<Result<Streams, AppError>>;
  getMemberStreams(): Promise<Result<Streams, AppError>>;
  deletedListIds(): Promise<Result<string[], AppError>>;
  searchByStreamsIdsAndCreate(
    params: SearchByStreamIdsAndCreateParam,
  ): Promise<Result<Streams, AppError>>;
}

export class StreamInteractor implements IStreamInteractor {
  constructor(private readonly context: IAppContext) {}

  // Fetch new streams from external APIs
  async searchLive(): Promise<Result<Streams, AppError>> {
    return await withTracerResult(
      "StreamInteractor",
      "searchLive",
      async () => {
        return this.context.runInTx(async (_repos, services) => {
          const sv = await services.streamService.searchAllLiveStreams();
          if (sv.err) {
            return sv;
          }
          return Ok(sv.val);
        });
      },
    );
  }

  // Fetch streams from database and external APIs
  async searchExist(): Promise<Result<Streams, AppError>> {
    return await withTracerResult(
      "StreamInteractor",
      "searchExist",
      async () => {
        return this.context.runInTx(async (_repos, services) => {
          const sv = await services.streamService.searchExistStreams();
          if (sv.err) {
            return sv;
          }
          return Ok(sv.val);
        });
      },
    );
  }

  async batchUpsert(
    params: BatchUpsertStreamsParam,
  ): Promise<Result<Streams, AppError>> {
    return await withTracerResult(
      "StreamInteractor",
      "batchUpsert",
      async () => {
        return this.context.runInTx(async (repos, _services) => {
          const uv = await repos.streamRepository.batchUpsert(params);
          if (uv.err) {
            return uv;
          }
          return Ok(uv.val);
        });
      },
    );
  }

  async list(params: ListParam): Promise<Result<ListResponse, AppError>> {
    return await withTracerResult("StreamInteractor", "list", async () => {
      return this.context.runInTx(async (repos, _services) => {
        const sv = await repos.streamRepository.list(params);
        if (sv.err) {
          return sv;
        }

        const c = await repos.streamRepository.count(params);
        if (c.err) {
          return c;
        }
        return Ok({
          streams: sv.val,
          pagination: createPage({
            currentPage: params.page,
            limit: params.limit,
            totalCount: c.val,
          }),
        });
      });
    });
  }

  async searchDeletedCheck(): Promise<Result<Streams, AppError>> {
    return await withTracerResult(
      "StreamInteractor",
      "searchDeletedCheck",
      async () => {
        return this.context.runInTx(async (repos, services) => {
          const sv = await services.streamService.searchDeletedStreams();
          if (sv.err) {
            return sv;
          }

          return Ok(sv.val);
        });
      },
    );
  }

  async batchDeleteByStreamIds(
    params: BatchDeleteByStreamIdsParam,
  ): Promise<Result<void, AppError>> {
    return await withTracerResult(
      "StreamInteractor",
      "batchDeleteByStreamIds",
      async () => {
        return this.context.runInTx(async (repos, _services) => {
          const uv = await repos.streamRepository.batchDelete(params.streamIds);
          if (uv.err) {
            return uv;
          }
          return uv;
        });
      },
    );
  }

  async translateStream(
    params: TranslateStreamParam,
  ): Promise<Result<Streams, AppError>> {
    return await withTracerResult(
      "StreamInteractor",
      "translateStream",
      async () => {
        return this.context.runInTx(async (_repos, services) => {
          const sv = await services.streamService.translateStreams(params);
          if (sv.err) {
            return sv;
          }
          return Ok(sv.val);
        });
      },
    );
  }

  async getMemberStreams(): Promise<Result<Streams, AppError>> {
    return await withTracerResult(
      "StreamInteractor",
      "getMemberStreams",
      async () => {
        return this.context.runInTx(async (_repos, services) => {
          const sv = await services.streamService.getMemberStreams();
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
      "StreamInteractor",
      "deletedListIds",
      async () => {
        return this.context.runInTx(async (repos, _services) => {
          const sv = await repos.streamRepository.deletedListIds();
          if (sv.err) {
            return sv;
          }
          AppLogger.info("deletedListIds", {
            streamIds: sv.val,
          });
          return Ok(sv.val);
        });
      },
    );
  }

  async searchByStreamsIdsAndCreate(
    params: SearchByStreamIdsAndCreateParam,
  ): Promise<Result<Streams, AppError>> {
    return await withTracerResult(
      "StreamInteractor",
      "searchByStreamsIdAndCreate",
      async () => {
        return this.context.runInTx(async (repos, services) => {
          const vs = await services.streamService.getStreamsByStreamIds(params);
          if (vs.err) {
            return vs;
          }

          const upsertedStreams = await repos.streamRepository.batchUpsert(
            vs.val,
          );
          if (upsertedStreams.err) {
            return upsertedStreams;
          }

          return Ok(upsertedStreams.val);
        });
      },
    );
  }
}
