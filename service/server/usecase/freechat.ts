import { type AppError, Ok, type Result } from "@vspo-lab/error";
import type { Freechats } from "../domain/freechat";
import { type Page, createPage } from "../domain/pagination";
import type { IAppContext } from "../infra/dependency";

export type BatchUpsertFreechatsParam = Freechats;

export type ListFreechatsQuery = {
  limit: number;
  page: number;
  memberType?: string;
  languageCode: string; // ISO 639-1 language code or [default] explicitly specified to narrow down to 1creator
  orderBy?: "asc" | "desc";
  orderKey?: "publishedAt" | "creatorName";
  channelIds?: string[];
  includeDeleted?: boolean;
};

export type ListFreechatsResponse = {
  freechats: Freechats;
  pagination: Page;
};

export interface IFreechatInteractor {
  list(
    query: ListFreechatsQuery,
  ): Promise<Result<ListFreechatsResponse, AppError>>;
}

export class FreechatInteractor implements IFreechatInteractor {
  constructor(private readonly context: IAppContext) {}

  async list(
    query: ListFreechatsQuery,
  ): Promise<Result<ListFreechatsResponse, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      const freechats = await repos.freechatRepository.list(query);

      if (freechats.err) {
        return freechats;
      }

      const pagination = await repos.freechatRepository.count(query);

      if (pagination.err) {
        return pagination;
      }

      return Ok({
        freechats: freechats.val,
        pagination: createPage({
          currentPage: query.page,
          limit: query.limit,
          totalCount: pagination.val,
        }),
      });
    });
  }
}
