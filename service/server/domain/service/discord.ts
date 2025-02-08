import type { APIEmbed } from "discord-api-types/v10";
import { Embed } from "discord-hono";
import type { IDiscordServerRepository } from "../../infra";
import type { IDiscordClinet } from "../../infra/discord";
import { convertToUTCDate, getCurrentUTCString } from "../../pkg/dayjs";
import {
  type AppError,
  ErrorCodeSchema,
  Ok,
  type Result,
} from "../../pkg/errors";
import { createUUID } from "../../pkg/uuid";
import {
  DiscordChannels,
  type DiscordServer,
  DiscordServers,
  createDiscordServer,
  discordChannels,
  discordServer,
} from "../discord";
import type { Videos } from "../video";

type SendMessageParams = {
  channelIds: string[];
  content: string;
  videos: Videos;
};

type RetryErrorChannelId = string;

type AdjustBotChannelParams = {
  type: "add" | "remove";
  serverId: string;
  targetChannelId: string;
  serverLangaugeCode?: string;
  channelLangaugeCode?: string;
};

export interface IDiscordService {
  sendVideosToMultipleChannels(
    params: SendMessageParams,
  ): Promise<Result<RetryErrorChannelId[], AppError>>;
  adjustBotChannel(
    params: AdjustBotChannelParams,
  ): Promise<Result<DiscordServer, AppError>>;
}

export class DiscordService implements IDiscordService {
  constructor(
    private readonly deps: {
      discordClient: IDiscordClinet;
      discordServerRepository: IDiscordServerRepository;
    },
  ) {}

  async sendVideosToMultipleChannels(
    params: SendMessageParams,
  ): Promise<Result<RetryErrorChannelId[], AppError>> {
    const embeds: APIEmbed[] = params.videos.map((video) =>
      new Embed().title(video.title).toJSON(),
    );

    const promises = params.channelIds.map((channelId) => {
      return this.deps.discordClient.sendMessage({
        channelId: channelId,
        content: params.content,
        embeds: embeds,
      });
    });

    const results = await Promise.allSettled(promises);

    const errorChannelIds = results
      .map((result, index) => {
        if (result.status === "fulfilled" && result.value.err) {
          if (result.value.err.code === ErrorCodeSchema.Enum.RATE_LIMITED) {
            return params.channelIds[index];
          }
        }
        return null;
      })
      .filter((channelId): channelId is string => channelId !== null);

    return Ok(errorChannelIds);
  }

  // Add/remove channels that the bot is participating in
  async adjustBotChannel(
    params: AdjustBotChannelParams,
  ): Promise<Result<DiscordServer, AppError>> {
    let server: DiscordServer;

    const isExist = await this.deps.discordServerRepository.exists({
      serverId: params.serverId,
    });

    if (isExist.err) {
      return isExist;
    }

    if (!isExist.val) {
      const d = getCurrentUTCString();
      server = createDiscordServer({
        id: createUUID(),
        rawId: params.serverId,
        name: "",
        languageCode: "default",
        discordChannels: [],
        createdAt: d,
        updatedAt: d,
      });
    } else {
      const s = await this.deps.discordServerRepository.get({
        serverId: params.serverId,
      });
      if (s.err) {
        return s;
      }
      server = s.val;
    }

    let discordChannels = server.discordChannels;

    switch (params.type) {
      case "add": {
        const c = await this.deps.discordClient.getChannel({
          serverId: params.serverId,
          channelId: params.targetChannelId,
        });
        if (c.err) {
          return c;
        }
        c.val.languageCode = params.channelLangaugeCode ?? c.val.languageCode;
        server.languageCode = params.serverLangaugeCode ?? server.languageCode;
        const index = discordChannels.findIndex(
          (ch) => ch.rawId === c.val.rawId,
        );
        if (index >= 0) {
          discordChannels[index] = {
            ...c.val,
            id: discordChannels[index].id
          };
        } else {
          discordChannels.push(c.val);
        }
        break;
      }
      case "remove": {
        discordChannels = discordChannels.filter(
          (c) => c.rawId !== params.targetChannelId,
        );
        break;
      }
    }
    return Ok(
      discordServer.parse({
        ...server,
        discordChannels: discordChannels,
      }),
    );
  }
}
