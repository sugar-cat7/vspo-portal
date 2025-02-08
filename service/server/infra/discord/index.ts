import type {
  APIChannel,
  APIEmbed,
  RESTGetAPIChannelResult,
} from "discord-api-types/v10";
import type { CommandHandler, Rest } from "discord-hono";
import {
  DiscordHono as DHono,
  Rest as DRest,
  _channels_$,
  _channels_$_messages,
} from "discord-hono";
import type { DiscordEnv } from "../../config/env/discord";
import { type DiscordChannel, discordChannel } from "../../domain";
import {
  AppError,
  Err,
  ErrorCodeSchema,
  Ok,
  type Result,
  wrap,
} from "../../pkg/errors";
import { createUUID } from "../../pkg/uuid";

type SendMessageParams = {
  channelId: string;
  content: string;
  embeds?: APIEmbed[];
};

type GetChannelInfoParams = {
  serverId: string;
  channelId: string;
};

export interface IDiscordClinet {
  sendMessage(params: SendMessageParams): Promise<Result<void, AppError>>;
  getChannel(
    params: GetChannelInfoParams,
  ): Promise<Result<DiscordChannel, AppError>>;
}

export class DiscordClinet implements IDiscordClinet {
  rest: Rest;

  constructor(env: DiscordEnv) {
    this.rest = new DRest(env.DISCORD_TOKEN);
  }

  /**
   * Send a message to a channel outside of an interaction context.
   */
  async sendMessage(
    params: SendMessageParams,
  ): Promise<Result<void, AppError>> {
    const { channelId, content, embeds } = params;

    const response = await this.rest.post(_channels_$_messages, [channelId], {
      content,
      embeds,
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const rateLimit = response.headers.get("X-RateLimit-Limit");
        const remaining = response.headers.get("X-RateLimit-Remaining");
        const reset = response.headers.get("X-RateLimit-Reset");
        return Err(
          new AppError({
            message: `Rate limited: ${retryAfter}ms, ${rateLimit} requests, ${remaining} remaining, ${reset} reset`,
            code: ErrorCodeSchema.Enum.RATE_LIMITED,
          }),
        );
      }
      return Err(
        new AppError({
          message: `Failed to send message to channel ${channelId}`,
          code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
        }),
      );
    }

    return Ok();
  }

  /**
   * Get channel information.
   */
  async getChannel(
    params: GetChannelInfoParams,
  ): Promise<Result<DiscordChannel, AppError>> {
    const { channelId } = params;
    // ignore ts
    //@ts-ignore
    const { response, result } = await this.rest.get(_channels_$, [channelId]);
    if (!response.ok) {
      return Err(
        new AppError({
          message: `Failed to fetch channel info for ${channelId}`,
          code: ErrorCodeSchema.Enum.NOT_FOUND,
        }),
      );
    }

    if (!result) {
      return Err(
        new AppError({
          message: `Channel info for ${channelId} is undefined`,
          code: ErrorCodeSchema.Enum.NOT_FOUND,
        }),
      );
    }
    const c = result as unknown as APIChannel;
    return Ok(
      discordChannel.parse({
        id: createUUID(),
        rawId: c.id,
        serverId: params.serverId,
        name: c.name,
      }),
    );
  }
}
