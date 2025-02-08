import type { DiscordServer, DiscordServers, Videos } from "../domain";
import type { IAppContext } from "../infra/dependency";
import { type AppError, Ok, type Result } from "../pkg/errors";

export type SendMessageParams = {
  channelIds: string[];
  content: string;
  videos: Videos;
};

export type AdjustBotChannelParams = {
  type: "add" | "remove";
  serverId: string;
  targetChannelId: string;
  serverLangaugeCode?: string;
  channelLangaugeCode?: string;
};

export type RetryErrorChannelId = string;

export type BatchUpsertDiscordServersParam = DiscordServers;

export interface IDiscordInteractor {
  batchSendMessages(
    params: SendMessageParams,
  ): Promise<Result<RetryErrorChannelId[], AppError>>;
  adjustBotChannel(
    params: AdjustBotChannelParams,
  ): Promise<Result<DiscordServer, AppError>>;
  get(serverId: string): Promise<Result<DiscordServer, AppError>>;
  batchUpsert(
    params: BatchUpsertDiscordServersParam,
  ): Promise<Result<DiscordServers, AppError>>;
  batchDeleteChannelsByRowChannelIds(
    channelIds: string[],
  ): Promise<Result<void, AppError>>;
}

export class DiscordInteractor implements IDiscordInteractor {
  constructor(private readonly context: IAppContext) {}

  async get(serverId: string): Promise<Result<DiscordServer, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      const sv = await repos.discordServerRepository.get({ serverId });
      if (sv.err) {
        return sv;
      }
      return Ok(sv.val);
    });
  }

  async batchSendMessages(
    params: SendMessageParams,
  ): Promise<Result<RetryErrorChannelId[], AppError>> {
    return this.context.runInTx(async (_repos, services) => {
      const sv =
        await services.discordService.sendVideosToMultipleChannels(params);
      if (sv.err) {
        return sv;
      }
      return sv;
    });
  }

  async adjustBotChannel(
    params: AdjustBotChannelParams,
  ): Promise<Result<DiscordServer, AppError>> {
    return this.context.runInTx(async (_repos, services) => {
      const sv = await services.discordService.adjustBotChannel(params);
      if (sv.err) {
        return sv;
      }
      return Ok(sv.val);
    });
  }

  async batchUpsert(
    params: BatchUpsertDiscordServersParam,
  ): Promise<Result<DiscordServers, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      const sv = await repos.discordServerRepository.batchUpsert(params);
      if (sv.err) {
        return sv;
      }
      return Ok(sv.val);
    });
  }

  async batchDeleteChannelsByRowChannelIds(
    channelIds: string[],
  ): Promise<Result<void, AppError>> {
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
  }
}
