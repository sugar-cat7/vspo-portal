import type { APIEmbed } from "discord-api-types/v10";
import { Embed } from "discord-hono";
import type { IDiscordClinet } from "../../infra/discord";
import {
  type AppError,
  ErrorCodeSchema,
  Ok,
  type Result,
} from "../../pkg/errors";
import type { Videos } from "../video";

type SendMessageParams = {
  channelIds: string[];
  content: string;
  videos: Videos;
};

type RetryErrorChannelId = string;

export interface IDiscordService {
  sendVideosToMultipleChannels(
    params: SendMessageParams,
  ): Promise<Result<RetryErrorChannelId[], AppError>>;
}

export class DiscordService implements IDiscordService {
  constructor(
    private readonly deps: {
      discordClient: IDiscordClinet;
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
}
