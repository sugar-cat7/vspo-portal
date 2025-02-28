import type { DiscordServer, DiscordServers, Videos } from "../domain";
import { type Page, createPage } from "../domain/pagination";
import type { IAppContext } from "../infra/dependency";
import { withTracerResult } from "../infra/http/trace";
import { type AppError, Ok, type Result } from "../pkg/errors";

export type SendMessageParams = {
  channelIds: string[];
  channelLangaugeCode: string;
};

export type AdjustBotChannelParams = {
  type: "add" | "remove";
  serverId: string;
  targetChannelId: string;
  serverLangaugeCode?: string;
  channelLangaugeCode?: string;
};

export type ListDiscordServerParam = {
  limit: number;
  page: number;
};

export type ListDiscordServerResponse = {
  discordServers: DiscordServers;
  pagination: Page;
};

export type BatchUpsertDiscordServersParam = DiscordServers;

export interface IDiscordInteractor {
  batchSendMessages(params: SendMessageParams): Promise<Result<void, AppError>>;
  adjustBotChannel(
    params: AdjustBotChannelParams,
  ): Promise<Result<DiscordServer, AppError>>;
  get(serverId: string): Promise<Result<DiscordServer, AppError>>;
  list(
    params: ListDiscordServerParam,
  ): Promise<Result<ListDiscordServerResponse, AppError>>;
  deleteAllMessagesInChannel(
    channelId: string,
  ): Promise<Result<void, AppError>>;
  batchUpsert(
    params: BatchUpsertDiscordServersParam,
  ): Promise<Result<DiscordServers, AppError>>;
  batchDeleteChannelsByRowChannelIds(
    channelIds: string[],
  ): Promise<Result<void, AppError>>;
  exists(serverId: string): Promise<Result<boolean, AppError>>;
  existsChannel(channelId: string): Promise<Result<boolean, AppError>>;
}

export class DiscordInteractor implements IDiscordInteractor {
  constructor(private readonly context: IAppContext) {}

  async list(
    params: ListDiscordServerParam,
  ): Promise<Result<ListDiscordServerResponse, AppError>> {
    return await withTracerResult("DiscordInteractor", "list", async () => {
      return this.context.runInTx(async (repos, _services) => {
        const sv = await repos.discordServerRepository.list(params);
        if (sv.err) {
          return sv;
        }

        const count = await repos.discordServerRepository.count(params);
        if (count.err) {
          return count;
        }
        return Ok({
          discordServers: sv.val,
          pagination: createPage({
            currentPage: params.page,
            limit: params.limit,
            totalCount: count.val,
          }),
        });
      });
    });
  }

  async get(serverId: string): Promise<Result<DiscordServer, AppError>> {
    return await withTracerResult("DiscordInteractor", "get", async () => {
      return this.context.runInTx(async (repos, _services) => {
        const sv = await repos.discordServerRepository.get({ serverId });
        if (sv.err) {
          return sv;
        }
        return Ok(sv.val);
      });
    });
  }

  async exists(serverId: string): Promise<Result<boolean, AppError>> {
    return await withTracerResult("DiscordInteractor", "exists", async () => {
      return this.context.runInTx(async (repos, _services) => {
        return await repos.discordServerRepository.exists({ serverId });
      });
    });
  }

  async batchSendMessages(
    params: SendMessageParams,
  ): Promise<Result<void, AppError>> {
    return await withTracerResult(
      "DiscordInteractor",
      "batchSendMessages",
      async () => {
        return this.context.runInTx(async (_repos, services) => {
          const v = await services.discordService.sendMessagesToChannel(params);

          if (v.err) {
            return v;
          }

          return Ok();
        });
      },
    );
  }

  async deleteAllMessagesInChannel(
    channelId: string,
  ): Promise<Result<void, AppError>> {
    return await withTracerResult(
      "DiscordInteractor",
      "deleteAllMessagesInChannel",
      async () => {
        return this.context.runInTx(async (_repos, services) => {
          const sv =
            await services.discordService.deleteAllMessagesInChannel(channelId);
          if (sv.err) {
            return sv;
          }
          return Ok();
        });
      },
    );
  }

  async adjustBotChannel(
    params: AdjustBotChannelParams,
  ): Promise<Result<DiscordServer, AppError>> {
    return await withTracerResult(
      "DiscordInteractor",
      "adjustBotChannel",
      async () => {
        return this.context.runInTx(async (_repos, services) => {
          const sv = await services.discordService.adjustBotChannel(params);
          if (sv.err) {
            return sv;
          }
          return Ok(sv.val);
        });
      },
    );
  }

  async batchUpsert(
    params: BatchUpsertDiscordServersParam,
  ): Promise<Result<DiscordServers, AppError>> {
    return await withTracerResult(
      "DiscordInteractor",
      "batchUpsert",
      async () => {
        return this.context.runInTx(async (repos, _services) => {
          const sv = await repos.discordServerRepository.batchUpsert(params);
          if (sv.err) {
            return sv;
          }
          return Ok(sv.val);
        });
      },
    );
  }

  async batchDeleteChannelsByRowChannelIds(
    channelIds: string[],
  ): Promise<Result<void, AppError>> {
    return await withTracerResult(
      "DiscordInteractor",
      "batchDeleteChannelsByRowChannelIds",
      async () => {
        return this.context.runInTx(async (repos, _services) => {
          const sv =
            await repos.discordServerRepository.batchDeleteChannelsByRowChannelIds(
              channelIds,
            );
          if (sv.err) {
            return sv;
          }
          return Ok();
        });
      },
    );
  }

  async existsChannel(channelId: string): Promise<Result<boolean, AppError>> {
    return await withTracerResult(
      "DiscordInteractor",
      "existsChannel",
      async () => {
        return this.context.runInTx(async (repos, _services) => {
          return await repos.discordServerRepository.existsChannel({
            channelId,
          });
        });
      },
    );
  }
}
