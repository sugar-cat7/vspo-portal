import { type AppError, Ok, type Result } from "@vspo-lab/error";
import type { Clips } from "../domain/clip";
import type { Creators } from "../domain/creator";
import { type Page, createPage } from "../domain/pagination";
import type { IAppContext } from "../infra/dependency";
import { withTracerResult } from "../infra/http/trace";

export type BatchUpsertClipsParam = Clips;

export type ListClipsQuery = {
  limit: number;
  page: number;
  platform?: string;
  memberType?: string;
  languageCode: string;
  orderBy?: "asc" | "desc";
  channelIds?: string[];
  includeDeleted?: boolean;
  clipType?: "clip" | "short";
  orderKey?: "publishedAt" | "viewCount";
  afterPublishedAtDate?: Date;
  beforePublishedAtDate?: Date;
};

export type ListClipsResponse = {
  clips: Clips;
  pagination: Page;
};

export interface IClipInteractor {
  list(query: ListClipsQuery): Promise<Result<ListClipsResponse, AppError>>;
  batchUpsert(params: BatchUpsertClipsParam): Promise<Result<Clips, AppError>>;
  searchNewVspoClipsAndNewCreators(): Promise<
    Result<{ newCreators: Creators; clips: Clips }, AppError>
  >;
  searchExistVspoClips({
    clipIds,
  }: { clipIds: string[] }): Promise<
    Result<{ clips: Clips; notExistsClipIds: string[] }, AppError>
  >;
  searchNewClipsByVspoMemberName(): Promise<
    Result<{ newCreators: Creators; clips: Clips }, AppError>
  >;
  deleteClips({
    clipIds,
  }: { clipIds: string[] }): Promise<Result<void, AppError>>;
}

export const createClipInteractor = (context: IAppContext): IClipInteractor => {
  const INTERACTOR_NAME = "ClipInteractor";

  const list = async (
    query: ListClipsQuery,
  ): Promise<Result<ListClipsResponse, AppError>> => {
    return await withTracerResult(INTERACTOR_NAME, "list", async () => {
      return context.runInTx(async (repos, _services) => {
        const clips = await repos.clipRepository.list(query);

        if (clips.err) {
          return clips;
        }

        const pagination = await repos.clipRepository.count(query);

        if (pagination.err) {
          return pagination;
        }

        return Ok({
          clips: clips.val,
          pagination: createPage({
            currentPage: query.page,
            limit: query.limit,
            totalCount: pagination.val,
          }),
        });
      });
    });
  };

  const batchUpsert = async (
    params: BatchUpsertClipsParam,
  ): Promise<Result<Clips, AppError>> => {
    return await withTracerResult(INTERACTOR_NAME, "batchUpsert", async () => {
      return context.runInTx(async (repos, _services) => {
        return repos.clipRepository.batchUpsert(params);
      });
    });
  };

  const searchNewVspoClipsAndNewCreators = async (): Promise<
    Result<{ newCreators: Creators; clips: Clips }, AppError>
  > => {
    return await withTracerResult(
      INTERACTOR_NAME,
      "searchNewVspoClipsAndNewCreators",
      async () => {
        return context.runInTx(async (repos, services) => {
          return services.clipService.searchNewVspoClipsAndNewCreators();
        });
      },
    );
  };

  const searchExistVspoClips = async ({
    clipIds,
  }: { clipIds: string[] }): Promise<
    Result<{ clips: Clips; notExistsClipIds: string[] }, AppError>
  > => {
    return await withTracerResult(
      INTERACTOR_NAME,
      "searchExistVspoClips",
      async () => {
        return context.runInTx(async (repos, services) => {
          return services.clipService.searchExistVspoClips({ clipIds });
        });
      },
    );
  };

  const searchNewClipsByVspoMemberName = async (): Promise<
    Result<{ newCreators: Creators; clips: Clips }, AppError>
  > => {
    return await withTracerResult(
      INTERACTOR_NAME,
      "searchNewClipsByVspoMemberName",
      async () => {
        return context.runInTx(async (repos, services) => {
          return services.clipService.searchNewClipsByVspoMemberName();
        });
      },
    );
  };

  const deleteClips = async ({
    clipIds,
  }: { clipIds: string[] }): Promise<Result<void, AppError>> => {
    return await withTracerResult(INTERACTOR_NAME, "deleteClips", async () => {
      return context.runInTx(async (repos, services) => {
        return repos.clipRepository.batchDelete(clipIds);
      });
    });
  };

  return {
    list,
    batchUpsert,
    searchNewVspoClipsAndNewCreators,
    searchExistVspoClips,
    searchNewClipsByVspoMemberName,
    deleteClips,
  };
};
