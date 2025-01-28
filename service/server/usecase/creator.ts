import { Creators } from "../domain/creator";
import { createPage, Page } from "../domain/pagination";
import { IAppContext } from "../infra/dependency";
import { AppError, Ok, Result } from "../pkg/errors";

export type BatchUpsertCreatorsParam = Creators;

export type SearchByChannelIdsParam = {
  channel: {
    id: string;
    memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
  }[];
};

export type ListByMemberTypeParam = {
  limit: number;
  page: number;
  memberType?: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
};

type ListResponse = {
  creators: Creators;
  pagination: Page;
};

export type SearchByMemberTypeParam = {
  memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
};

export interface ICreatorInteractor {
  searchByChannelIds(params: SearchByChannelIdsParam): Promise<Result<Creators, AppError>>;
  searchByMemberType(params: SearchByMemberTypeParam): Promise<Result<Creators, AppError>>;
  batchUpsert(params: BatchUpsertCreatorsParam): Promise<Result<Creators, AppError>>;
  list(params: ListByMemberTypeParam): Promise<Result<ListResponse, AppError>>;
}

export class CreatorInteractor implements ICreatorInteractor {
  constructor(private readonly context: IAppContext) {}

  async searchByChannelIds(
    params: SearchByChannelIdsParam
  ): Promise<Result<Creators, AppError>> {
    return this.context.runInTx(async (_repos, services) => {
      const sv = await services.creatorService.searchCreatorsByChannelIds(
        params.channel.map((v) => ({
          channelId: v.id,
          memberType: v.memberType,
        }))
      );
      if (sv.err) return sv;

      return Ok(sv.val);
    });
  }

  async batchUpsert(params: BatchUpsertCreatorsParam): Promise<Result<Creators, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      const uv = await repos.creatorRepository.batchUpsert(params);
      if (uv.err) return uv;

      return Ok(uv.val);
    });
  }
  async searchByMemberType(
    params: SearchByMemberTypeParam
  ): Promise<Result<Creators, AppError>> {
    return this.context.runInTx(async (_repos, services) => {
      const sv = await services.creatorService.searchCreatorsByMemberType({
        memberType: params.memberType,
      });
      if (sv.err) return sv;

      return Ok(sv.val);
    });
  }

  async list(params: ListByMemberTypeParam): Promise<Result<ListResponse, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      const c = await repos.creatorRepository.list(params);
      if (c.err) return c;

      const count = await repos.creatorRepository.count(params);
      if (count.err) return count;

      return Ok({
        creators: c.val,
        pagination: createPage({
          currentPage: params.page,
          limit: params.limit,
          totalCount: count.val,
        }),
      });
    });
  }
}
