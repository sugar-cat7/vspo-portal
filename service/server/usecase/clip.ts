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

export class ClipInteractor implements IClipInteractor {
  constructor(private readonly context: IAppContext) {}

  async list(
    query: ListClipsQuery,
  ): Promise<Result<ListClipsResponse, AppError>> {
    return await withTracerResult("ClipInteractor", "list", async () => {
      return this.context.runInTx(async (repos, _services) => {
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
  }

  async batchUpsert(
    params: BatchUpsertClipsParam,
  ): Promise<Result<Clips, AppError>> {
    return await withTracerResult("ClipInteractor", "batchUpsert", async () => {
      return this.context.runInTx(async (repos, _services) => {
        return repos.clipRepository.batchUpsert(params);
      });
    });
  }

  async searchNewVspoClipsAndNewCreators(): Promise<
    Result<{ newCreators: Creators; clips: Clips }, AppError>
  > {
    return await withTracerResult(
      "ClipInteractor",
      "searchNewVspoClipsAndNewCreators",
      async () => {
        return this.context.runInTx(async (repos, services) => {
          return services.clipService.searchNewVspoClipsAndNewCreators();
        });
      },
    );
  }

  async searchExistVspoClips({
    clipIds,
  }: { clipIds: string[] }): Promise<
    Result<{ clips: Clips; notExistsClipIds: string[] }, AppError>
  > {
    return await withTracerResult(
      "ClipInteractor",
      "searchExistVspoClips",
      async () => {
        return this.context.runInTx(async (repos, services) => {
          return services.clipService.searchExistVspoClips({ clipIds });
        });
      },
    );
  }

  async searchNewClipsByVspoMemberName(): Promise<
    Result<{ newCreators: Creators; clips: Clips }, AppError>
  > {
    return await withTracerResult(
      "ClipInteractor",
      "searchNewClipsByVspoMemberName",
      async () => {
        return this.context.runInTx(async (repos, services) => {
          return services.clipService.searchNewClipsByVspoMemberName();
        });
      },
    );
  }

  async deleteClips({
    clipIds,
  }: { clipIds: string[] }): Promise<Result<void, AppError>> {
    return await withTracerResult("ClipInteractor", "deleteClips", async () => {
      return this.context.runInTx(async (repos, services) => {
        return repos.clipRepository.batchDelete(clipIds);
      });
    });
  }
}
