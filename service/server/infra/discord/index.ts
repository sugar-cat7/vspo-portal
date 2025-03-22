import type { RestManager } from "@discordeno/rest";
import { createRestManager } from "@discordeno/rest";
import type { DiscordEmbed } from "@discordeno/types";
import type { DiscordEnv } from "../../config/env/discord";
import {
  type DiscordChannel,
  type DiscordMessage,
  discordChannel,
  discordMessage,
  discordMessages,
  getStatusFromColor,
} from "../../domain";
import { getCurrentUTCString } from "../../pkg/dayjs";
import {
  AppError,
  Err,
  type ErrorCode,
  ErrorCodeSchema,
  Ok,
  type Result,
  wrap,
} from "../../pkg/errors";
import { AppLogger } from "../../pkg/logging";
import { createUUID } from "../../pkg/uuid";
import { withTracerResult } from "../http/trace/cloudflare";

type SendMessageParams = {
  channelId: string;
  content: string;
  embeds?: DiscordEmbed[];
};

type GetChannelInfoParams = {
  serverId: string;
  channelId: string;
};

type UpdateMessageParams = {
  channelId: string;
  messageId: string;
  content?: string;
  embeds?: DiscordEmbed[];
};

type DeleteMessageParams = {
  channelId: string;
  messageId: string;
};

type GetMessageParams = {
  channelId: string;
  messageId: string;
};

export interface IDiscordClient {
  sendMessage(params: SendMessageParams): Promise<Result<string, AppError>>;
  getChannel(
    params: GetChannelInfoParams,
  ): Promise<Result<DiscordChannel, AppError>>;
  updateMessage(params: UpdateMessageParams): Promise<Result<string, AppError>>;
  deleteMessage(params: DeleteMessageParams): Promise<Result<string, AppError>>;
  getLatestBotMessages(
    channelId: string,
  ): Promise<Result<DiscordMessage[], AppError>>;
  getMessage(
    params: GetMessageParams,
  ): Promise<Result<DiscordMessage, AppError>>;
}

export class DiscordClient implements IDiscordClient {
  rest: RestManager;
  botId: string;

  constructor(env: DiscordEnv) {
    this.rest = createRestManager({
      token: env.DISCORD_TOKEN,
    });
    this.botId = env.DISCORD_APPLICATION_ID;
  }

  // Helper function to determine the appropriate error code based on Discord API errors
  private getErrorCodeFromDiscordError(err: Error): ErrorCode {
    // https://github.com/discordeno/discordeno/blob/main/packages/rest/src/manager.ts
    if (err.cause && typeof err.cause === "object" && "status" in err.cause) {
      const status = (err.cause as { status: number }).status;

      switch (status) {
        case 429:
          return "RATE_LIMITED";
        case 403:
          return "FORBIDDEN";
        case 404:
          return "NOT_FOUND";
        default:
          return "INTERNAL_SERVER_ERROR";
      }
    }

    // If there's no status in the error, check message for common error strings
    const errorMessage = err.message.toLowerCase();
    if (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("too many requests")
    ) {
      return "RATE_LIMITED";
    }
    if (
      errorMessage.includes("forbidden") ||
      errorMessage.includes("unauthorized")
    ) {
      return "FORBIDDEN";
    }
    if (errorMessage.includes("not found")) {
      return "NOT_FOUND";
    }

    return "INTERNAL_SERVER_ERROR";
  }

  async sendMessage(
    params: SendMessageParams,
  ): Promise<Result<string, AppError>> {
    return withTracerResult("discord", "sendMessage", async (span) => {
      const { channelId, content, embeds } = params;
      AppLogger.info("Sending message to Discord channel", {
        channel_id: channelId,
        has_embeds: embeds ? embeds.length > 0 : false,
      });

      const responseResult = await wrap(
        this.rest.sendMessage(channelId, {
          content,
          embeds: embeds?.slice(0, 10),
        }),
        (err: Error) => {
          AppLogger.error("Failed to send message to Discord channel", {
            channel_id: channelId,
            error: err,
          });

          const errorCode = this.getErrorCodeFromDiscordError(err);

          return new AppError({
            message: `Failed to send message to channel ${channelId}: ${err.message}`,
            code: errorCode,
            cause: err.cause,
          });
        },
      );
      if (responseResult.err) return Err(responseResult.err);

      AppLogger.info("Successfully sent message to Discord channel", {
        channel_id: channelId,
      });
      return Ok(responseResult.val.id);
    });
  }

  async getChannel(
    params: GetChannelInfoParams,
  ): Promise<Result<DiscordChannel, AppError>> {
    return withTracerResult("discord", "getChannel", async (span) => {
      const { channelId, serverId } = params;
      AppLogger.info("Fetching Discord channel info", {
        channel_id: channelId,
        server_id: serverId,
      });

      const responseResult = await wrap(
        this.rest.getChannel(channelId),
        (err: Error) => {
          AppLogger.error("Failed to fetch Discord channel info", {
            channel_id: channelId,
            server_id: serverId,
            error: err,
          });

          const errorCode = this.getErrorCodeFromDiscordError(err);

          return new AppError({
            message: `Failed to fetch channel info for ${channelId}: ${err.message}`,
            code: errorCode,
            cause: err.cause,
          });
        },
      );
      if (responseResult.err) return Err(responseResult.err);
      const channel = responseResult.val;
      if (!channel) {
        AppLogger.error("Discord channel not found", {
          channel_id: channelId,
          server_id: serverId,
        });
        return Err(
          new AppError({
            message: `Channel info for ${channelId} is undefined`,
            code: ErrorCodeSchema.Enum.NOT_FOUND,
          }),
        );
      }

      AppLogger.info("Successfully fetched Discord channel info", {
        channel_id: channelId,
        server_id: serverId,
        channel_name: channel.name,
      });
      return Ok(
        discordChannel.parse({
          id: createUUID(),
          rawId: channel.id,
          serverId,
          name: channel.name,
        }),
      );
    });
  }

  async updateMessage(
    params: UpdateMessageParams,
  ): Promise<Result<string, AppError>> {
    return withTracerResult("discord", "updateMessage", async (span) => {
      const { channelId, messageId, content, embeds } = params;
      AppLogger.info("Updating Discord message", {
        channel_id: channelId,
        message_id: messageId,
        has_embeds: embeds ? embeds.length > 0 : false,
      });

      const responseResult = await wrap(
        this.rest.editMessage(channelId, messageId, {
          content,
          embeds: embeds?.slice(0, 10),
        }),
        (err: Error) => {
          AppLogger.error("Failed to update Discord message", {
            channel_id: channelId,
            message_id: messageId,
            error: err,
          });

          const errorCode = this.getErrorCodeFromDiscordError(err);

          return new AppError({
            message: `Failed to update message. channelId=${channelId}, messageId=${messageId}: ${err.message}`,
            code: errorCode,
            cause: err.cause,
          });
        },
      );
      if (responseResult.err) return Err(responseResult.err);

      AppLogger.info("Successfully updated Discord message", {
        channel_id: channelId,
        message_id: messageId,
      });
      return Ok(messageId);
    });
  }

  async deleteMessage(
    params: DeleteMessageParams,
  ): Promise<Result<string, AppError>> {
    return withTracerResult("discord", "deleteMessage", async (span) => {
      const { channelId, messageId } = params;
      AppLogger.info("Deleting Discord message", {
        channel_id: channelId,
        message_id: messageId,
      });

      const getMsgResult = await wrap(
        this.rest.getMessage(channelId, messageId),
        (err: Error) => {
          AppLogger.error("Failed to fetch Discord message for deletion", {
            channel_id: channelId,
            message_id: messageId,
            error: err,
          });

          const errorCode = this.getErrorCodeFromDiscordError(err);

          return new AppError({
            message: `Failed to fetch message. channelId=${channelId}, messageId=${messageId}: ${err.message}`,
            code: errorCode,
            cause: err.cause,
          });
        },
      );
      if (getMsgResult.err) return Err(getMsgResult.err);
      const message = getMsgResult.val;
      if (!message.author?.bot || message.author.id !== this.botId) {
        AppLogger.warn("Attempted to delete non-bot message", {
          channel_id: channelId,
          message_id: messageId,
          author_id: message.author?.id,
          bot_id: this.botId,
        });
        return Err(
          new AppError({
            message: `Message is not sent by bot. channelId=${channelId}, messageId=${messageId}`,
            code: ErrorCodeSchema.Enum.FORBIDDEN,
          }),
        );
      }

      const deleteResult = await wrap(
        this.rest.deleteMessage(channelId, messageId),
        (err: Error) => {
          AppLogger.error("Failed to delete Discord message", {
            channel_id: channelId,
            message_id: messageId,
            error: err,
          });

          const errorCode = this.getErrorCodeFromDiscordError(err);

          return new AppError({
            message: `Failed to delete message. channelId=${channelId}, messageId=${messageId}: ${err.message}`,
            code: errorCode,
            cause: err.cause,
          });
        },
      );
      if (deleteResult.err) return Err(deleteResult.err);

      AppLogger.info("Successfully deleted Discord message", {
        channel_id: channelId,
        message_id: messageId,
      });
      return Ok(messageId);
    });
  }

  async getLatestBotMessages(
    channelId: string,
  ): Promise<Result<DiscordMessage[], AppError>> {
    return withTracerResult("discord", "getLatestBotMessages", async (span) => {
      AppLogger.info("Fetching latest bot messages from Discord channel", {
        channel_id: channelId,
      });

      const query = { limit: 100 };
      const responseResult = await wrap(
        this.rest.getMessages(channelId, query),
        (err: Error) => {
          AppLogger.error("Failed to fetch messages from Discord channel", {
            channel_id: channelId,
            error: err,
          });

          const errorCode = this.getErrorCodeFromDiscordError(err);

          return new AppError({
            message: `Failed to fetch messages in channel ${channelId}: ${err.message}`,
            code: errorCode,
            cause: err.cause,
          });
        },
      );
      if (responseResult.err) return Err(responseResult.err);
      const messages = responseResult.val;
      const botMessages = messages.filter(
        (m) => m.author?.bot && m.author.id === this.botId,
      );

      AppLogger.info("Successfully fetched bot messages from Discord channel", {
        channel_id: channelId,
        message_count: botMessages.length,
      });
      return Ok(
        discordMessages.parse(
          botMessages.map((m) => ({
            id: createUUID(),
            type: "bot",
            rawId: m.id,
            channelId,
            content: m.content ?? "",
            createdAt: getCurrentUTCString(),
            updatedAt: getCurrentUTCString(),
            embedVideos:
              m.embeds.map((e) => ({
                identifier: e.url,
                title: e.title,
                url: e.url,
                thumbnail: e.image?.url ?? "",
                startedAt: e.fields?.[0]?.value ?? "",
                status: getStatusFromColor(e.color ?? 0),
              })) ?? [],
          })),
        ),
      );
    });
  }

  async getMessage(
    params: GetMessageParams,
  ): Promise<Result<DiscordMessage, AppError>> {
    return withTracerResult("discord", "getMessage", async (span) => {
      const { channelId, messageId } = params;
      AppLogger.info("Fetching Discord message", {
        channel_id: channelId,
        message_id: messageId,
      });

      const responseResult = await wrap(
        this.rest.getMessage(channelId, messageId),
        (err: Error) => {
          AppLogger.error("Failed to fetch Discord message", {
            channel_id: channelId,
            message_id: messageId,
            error: err,
          });

          const errorCode = this.getErrorCodeFromDiscordError(err);

          return new AppError({
            message: `Failed to fetch message. channelId=${channelId}, messageId=${messageId}: ${err.message}`,
            code: errorCode,
            cause: err.cause,
          });
        },
      );
      if (responseResult.err) return Err(responseResult.err);
      const message = responseResult.val;

      AppLogger.info("Successfully fetched Discord message", {
        channel_id: channelId,
        message_id: messageId,
      });
      return Ok(
        discordMessage.parse({
          id: createUUID(),
          type: "bot",
          rawId: message.id,
          channelId,
          content: message.content ?? "",
          createdAt: getCurrentUTCString(),
          updatedAt: getCurrentUTCString(),
          embedVideos: message.embeds.map((e) => ({
            identifier: e.url,
            title: e.title,
            url: e.url,
            thumbnail: e.image?.url ?? "",
            startedAt: e.fields?.[0]?.value ?? "",
            status: getStatusFromColor(e.color ?? 0),
          })),
        }),
      );
    });
  }
}
