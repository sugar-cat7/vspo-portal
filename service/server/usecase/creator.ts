import { Creators } from "../domain/creator";
import { createPage, Page } from "../domain/pagination";
import { IAppContext } from "../infra/dependency";
import { AppError, Ok, Result } from "../pkg/errors";

type BatchUpsertByChannelIdsParam = {
  channel: {
    id: string;
    memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
  }[];
};

type BatchUpsertBySearchParam = {
  memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
};

type ListParam = {
  limit: number;
  page: number;
  memberType?: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
};

type ListResponse = {
  creators: Creators;
  pagination: Page;
};

interface ICreatorInteractor {
  batchUpsertByChannelIds(
    params: BatchUpsertByChannelIdsParam
  ): Promise<Result<Creators, AppError>>;
  batchUpsertBySearch(
    params: BatchUpsertBySearchParam
  ): Promise<Result<Creators, AppError>>;
  list(params: ListParam): Promise<Result<ListResponse, AppError>>;
}

export class CreatorInteractor implements ICreatorInteractor {
  constructor(private readonly context: IAppContext) {}

  async batchUpsertByChannelIds(
    params: BatchUpsertByChannelIdsParam
  ): Promise<Result<Creators, AppError>> {
    return this.context.runInTx(async (repos, services) => {
      const sv = await services.creatorService.searchCreatorsByChannelIds(
        params.channel.map((v) => ({
          channelId: v.id,
          memberType: v.memberType,
        }))
      );
      if (sv.err) return sv;

      const uv = await repos.creatorRepository.batchUpsert(sv.val);
      if (uv.err) return uv;

      return Ok(uv.val);
    });
  }

  async batchUpsertBySearch(
    params: BatchUpsertBySearchParam
  ): Promise<Result<Creators, AppError>> {
    return this.context.runInTx(async (repos, services) => {
      const sv = await services.creatorService.searchCreatorsByMemberType({
        memberType: params.memberType,
      });
      if (sv.err) return sv;

      const uv = await repos.creatorRepository.batchUpsert(sv.val);
      if (uv.err) return uv;

      return Ok(uv.val);
    });
  }

  async list(params: ListParam): Promise<Result<ListResponse, AppError>> {
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
