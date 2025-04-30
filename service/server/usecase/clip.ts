import type { Clips } from "../domain/clip";
import type { Creators } from "../domain/creator";
import { type Page, createPage } from "../domain/pagination";
import type { IAppContext } from "../infra/dependency";
import { type AppError, Ok, type Result } from "../pkg/errors";

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
  deleteClips({
    clipIds,
  }: { clipIds: string[] }): Promise<Result<void, AppError>>;
}

export class ClipInteractor implements IClipInteractor {
  constructor(private readonly context: IAppContext) {}

  async list(
    query: ListClipsQuery,
  ): Promise<Result<ListClipsResponse, AppError>> {
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
  }

  async batchUpsert(
    params: BatchUpsertClipsParam,
  ): Promise<Result<Clips, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      return repos.clipRepository.batchUpsert(params);
    });
  }

  async searchNewVspoClipsAndNewCreators(): Promise<
    Result<{ newCreators: Creators; clips: Clips }, AppError>
  > {
    return this.context.runInTx(async (repos, services) => {
      return services.clipService.searchNewVspoClipsAndNewCreators();
    });
  }

  async searchExistVspoClips({
    clipIds,
  }: { clipIds: string[] }): Promise<
    Result<{ clips: Clips; notExistsClipIds: string[] }, AppError>
  > {
    return this.context.runInTx(async (repos, services) => {
      return services.clipService.searchExistVspoClips({ clipIds });
    });
  }

  async deleteClips({
    clipIds,
  }: { clipIds: string[] }): Promise<Result<void, AppError>> {
    return this.context.runInTx(async (repos, services) => {
      return repos.clipRepository.batchDelete(clipIds);
    });
  }
}
