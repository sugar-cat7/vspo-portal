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
  ErrorCodeSchema,
  Ok,
  type Result,
  wrap,
} from "../../pkg/errors";
import { createUUID } from "../../pkg/uuid";

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
  sendMessage(params: SendMessageParams): Promise<Result<void, AppError>>;
  getChannel(
    params: GetChannelInfoParams,
  ): Promise<Result<DiscordChannel, AppError>>;
  updateMessage(params: UpdateMessageParams): Promise<Result<void, AppError>>;
  deleteMessage(params: DeleteMessageParams): Promise<Result<void, AppError>>;
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

  async sendMessage(
    params: SendMessageParams,
  ): Promise<Result<void, AppError>> {
    const { channelId, content, embeds } = params;
    const responseResult = await wrap(
      this.rest.sendMessage(channelId, { content, embeds }),
      (err: Error) =>
        new AppError({
          message: `Failed to send message to channel ${channelId}: ${err.message}`,
          code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
        }),
    );
    if (responseResult.err) return Err(responseResult.err);
    return Ok();
  }

  async getChannel(
    params: GetChannelInfoParams,
  ): Promise<Result<DiscordChannel, AppError>> {
    const { channelId, serverId } = params;
    const responseResult = await wrap(
      this.rest.getChannel(channelId),
      (err: Error) =>
        new AppError({
          message: `Failed to fetch channel info for ${channelId}: ${err.message}`,
          code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
        }),
    );
    if (responseResult.err) return Err(responseResult.err);
    const channel = responseResult.val;
    if (!channel) {
      return Err(
        new AppError({
          message: `Channel info for ${channelId} is undefined`,
          code: ErrorCodeSchema.Enum.NOT_FOUND,
        }),
      );
    }
    return Ok(
      discordChannel.parse({
        id: createUUID(),
        rawId: channel.id,
        serverId,
        name: channel.name,
      }),
    );
  }

  async updateMessage(
    params: UpdateMessageParams,
  ): Promise<Result<void, AppError>> {
    const { channelId, messageId, content, embeds } = params;
    const responseResult = await wrap(
      this.rest.editMessage(channelId, messageId, { content, embeds }),
      (err: Error) =>
        new AppError({
          message: `Failed to update message. channelId=${channelId}, messageId=${messageId}: ${err.message}`,
          code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
        }),
    );
    if (responseResult.err) return Err(responseResult.err);
    return Ok();
  }

  async deleteMessage(
    params: DeleteMessageParams,
  ): Promise<Result<void, AppError>> {
    const { channelId, messageId } = params;
    const getMsgResult = await wrap(
      this.rest.getMessage(channelId, messageId),
      (err: Error) =>
        new AppError({
          message: `Failed to fetch message. channelId=${channelId}, messageId=${messageId}: ${err.message}`,
          code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
        }),
    );
    if (getMsgResult.err) return Err(getMsgResult.err);
    const message = getMsgResult.val;
    if (!message.author?.bot || message.author.id !== this.botId) {
      return Err(
        new AppError({
          message: `Message is not sent by bot. channelId=${channelId}, messageId=${messageId}`,
          code: ErrorCodeSchema.Enum.FORBIDDEN,
        }),
      );
    }
    const deleteResult = await wrap(
      this.rest.deleteMessage(channelId, messageId),
      (err: Error) =>
        new AppError({
          message: `Failed to delete message. channelId=${channelId}, messageId=${messageId}: ${err.message}`,
          code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
        }),
    );
    if (deleteResult.err) return Err(deleteResult.err);
    return Ok();
  }

  async getLatestBotMessages(
    channelId: string,
  ): Promise<Result<DiscordMessage[], AppError>> {
    const query = { limit: 50 };
    const responseResult = await wrap(
      this.rest.getMessages(channelId, query),
      (err: Error) =>
        new AppError({
          message: `Failed to fetch messages in channel ${channelId}: ${err.message}`,
          code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
          cause: err.cause,
        }),
    );
    if (responseResult.err) return Err(responseResult.err);
    const messages = responseResult.val;
    const botMessages = messages.filter(
      (m) => m.author?.bot && m.author.id === this.botId,
    );
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
          embedVideos: m.embeds.map((e) => ({
            identifier: e.url,
            title: e.title,
            url: e.url,
            thumbnail: e.image?.url ?? "",
            startedAt: e.fields?.[0]?.value ?? "",
            status: getStatusFromColor(e.color ?? 0),
          })),
        })),
      ),
    );
  }

  async getMessage(
    params: GetMessageParams,
  ): Promise<Result<DiscordMessage, AppError>> {
    const { channelId, messageId } = params;
    const responseResult = await wrap(
      this.rest.getMessage(channelId, messageId),
      (err: Error) =>
        new AppError({
          message: `Failed to fetch message. channelId=${channelId}, messageId=${messageId}: ${err.message}`,
          code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
        }),
    );
    if (responseResult.err) return Err(responseResult.err);
    const message = responseResult.val;
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
  }
}
