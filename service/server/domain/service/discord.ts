import * as Sentry from "@sentry/cloudflare";
import {
  convertToUTCDate,
  getCurrentUTCDate,
  getCurrentUTCString,
} from "@vspo-lab/dayjs";
import { type AppError, Err, Ok, type Result } from "@vspo-lab/error";
import { AppLogger } from "@vspo-lab/logging";
import type {
  IDiscordMessageRepository,
  IDiscordServerRepository,
  IStreamRepository,
} from "../../infra";
import { type ICacheClient, cacheKey } from "../../infra/cache";
import type { IDiscordClient } from "../../infra/discord";
import { withTracerResult } from "../../infra/http/trace/cloudflare";
import { createUUID } from "../../pkg/uuid";
import {
  type DiscordServer,
  createDiscordServer,
  createStreamEmbed,
  discordServer,
} from "../discord";
import { runWithLanguage } from "../service/i18n";
import type { Stream } from "../stream";

// Parameters for sending messages to multiple channels
type ChannelMessageParams = {
  channelLangaugeCode: string;
  channelMemberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "vspo_all" | "general";
  channelIds: string[];
};

// Parameters for adjusting the bot's channels
type BotChannelAdjustmentParams = {
  type: "add" | "remove";
  serverId: string;
  targetChannelId: string;
  serverLangaugeCode?: string;
  channelLangaugeCode?: string;
  memberType?: "vspo_jp" | "vspo_en" | "vspo_ch" | "vspo_all" | "general";
};

type SendAdminMessageParams = {
  channelId: string;
  content: string;
};

type DeletedChannelCheckParams = {
  serverId: string;
  channelId: string;
};

export interface IDiscordService {
  sendMessagesToChannel(
    params: ChannelMessageParams,
  ): Promise<Result<void, AppError>>;
  adjustBotChannel(
    params: BotChannelAdjustmentParams,
  ): Promise<Result<DiscordServer, AppError>>;
  deleteAllMessagesInChannel(
    channelId: string,
  ): Promise<Result<void, AppError>>;
  sendAdminMessage(
    params: SendAdminMessageParams,
  ): Promise<Result<string, AppError>>;
  isDeletedChannel(
    params: DeletedChannelCheckParams,
  ): Promise<Result<boolean, AppError>>;
}

export class DiscordService implements IDiscordService {
  private readonly SERVICE_NAME = "DiscordService";

  // Constructor with dependency injection
  constructor(
    private readonly dependencies: {
      discordClient: IDiscordClient;
      discordServerRepository: IDiscordServerRepository;
      discordMessageRepository: IDiscordMessageRepository;
      streamRepository: IStreamRepository;
      cacheClient: ICacheClient;
    },
  ) {}

  /**
   * Process promises in batches with a delay between batches
   * @private
   */
  private async processBatchedPromises<T>(
    promises: Promise<T>[],
    batchSize = 50,
    delayMs = 1500,
  ): Promise<PromiseSettledResult<T>[]> {
    const allResults: PromiseSettledResult<T>[] = [];

    // Process a single batch
    const processBatch = async (batch: Promise<T>[]) => {
      const batchResults = await Promise.allSettled(batch);
      allResults.push(...batchResults);

      // Add delay between batches if there are more batches to process
      if (batch.length === batchSize) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    };

    // Process all batches
    for (let i = 0; i < promises.length; i += batchSize) {
      const batch = promises.slice(i, i + batchSize);
      await processBatch(batch);
    }

    return allResults;
  }

  /**
   * Send messages to multiple channels.
   * This includes upcoming stream messages and live diff messages.
   */
  async sendMessagesToChannel(
    options: ChannelMessageParams,
  ): Promise<Result<void, AppError>> {
    AppLogger.info("Sending messages to channels", {
      service: this.SERVICE_NAME,
      channelCount: options.channelIds.length,
      languageCode: options.channelLangaugeCode,
    });

    const span = Sentry.getActiveSpan();
    if (span) {
      span.setAttributes({
        channelIds: options.channelIds,
        channelLangaugeCode: options.channelLangaugeCode,
      });
    }

    // Use runWithLanguage to set the language context for the entire operation
    return runWithLanguage(options.channelLangaugeCode, async () => {
      const liveStreamListResult =
        await this.dependencies.streamRepository.list({
          limit: 1000,
          page: 0,
          languageCode: options.channelLangaugeCode,
          startedAt: convertToUTCDate(
            getCurrentUTCDate().setDate(getCurrentUTCDate().getDate() - 1),
          ),
          memberType: options.channelMemberType,
          status: "live",
          orderBy: "desc",
        });
      if (liveStreamListResult.err) {
        AppLogger.error("Failed to fetch stream list", {
          service: this.SERVICE_NAME,
          error: liveStreamListResult.err,
        });
        return Err(liveStreamListResult.err);
      }

      const liveStreams = liveStreamListResult.val;

      liveStreams.sort((a, b) => {
        return (
          new Date(a.startedAt || "").getTime() -
          new Date(b.startedAt || "").getTime()
        );
      });

      const upcomingStreamListResult =
        await this.dependencies.streamRepository.list({
          limit: 1000,
          page: 0,
          languageCode: options.channelLangaugeCode,
          startedAt: convertToUTCDate(
            getCurrentUTCDate().setDate(getCurrentUTCDate().getDate() - 1),
          ),
          memberType: options.channelMemberType,
          status: "upcoming",
          orderBy: "desc",
        });
      if (upcomingStreamListResult.err) {
        AppLogger.error("Failed to fetch stream list", {
          service: this.SERVICE_NAME,
          error: upcomingStreamListResult.err,
        });
        return Err(upcomingStreamListResult.err);
      }
      const upcomingStreams = upcomingStreamListResult.val;

      // Sort upcoming streams by broadcast start time in ascending order
      upcomingStreams.sort((a, b) => {
        return (
          new Date(a.startedAt || "").getTime() -
          new Date(b.startedAt || "").getTime()
        );
      });

      const promises = options.channelIds.map(async (channelId) => {
        const latestMessagesResult =
          await this.dependencies.discordClient.getLatestBotMessages(channelId);
        if (latestMessagesResult.err) {
          AppLogger.error("Failed to fetch latest bot messages", {
            service: this.SERVICE_NAME,
            channelId,
            error: latestMessagesResult.err,
          });
          return latestMessagesResult;
        }

        const messagePromises: Promise<Result<string, AppError>>[] = [];

        // Find existing upcoming message (there should be at most one)
        const upcomingMessage = latestMessagesResult.val.find((msg) =>
          msg.embedStreams.some((stream) => stream.status === "upcoming"),
        );

        // Find all live messages
        const liveMessages = latestMessagesResult.val.filter((msg) =>
          msg.embedStreams.some((stream) => stream.status === "live"),
        );

        // Process upcoming message
        if (upcomingMessage) {
          const upcomingStreamsInMessage = upcomingMessage.embedStreams;

          // Check if there is a difference between the embedded upcoming streams and the latest upcoming streams
          const hasDiff =
            upcomingStreams.some((v) => {
              return !upcomingStreamsInMessage.some(
                (v2) => v2.identifier === v.link,
              );
            }) ||
            upcomingStreamsInMessage.some((v) => {
              return !upcomingStreams.some((v2) => v2.link === v.identifier);
            });

          if (hasDiff) {
            messagePromises.push(
              this.dependencies.discordClient.updateMessage({
                channelId,
                messageId: upcomingMessage.rawId,
                embeds: upcomingStreams.map((stream) =>
                  createStreamEmbed(stream),
                ),
              }),
            );
          }
        } else {
          if (upcomingStreams.length > 0) {
            messagePromises.push(
              this.dependencies.discordClient.sendMessage({
                channelId,
                content: "",
                embeds: upcomingStreams.map((stream) =>
                  createStreamEmbed(stream),
                ),
              }),
            );
          }
        }

        for (const liveStream of liveStreams) {
          const liveMessage = liveMessages.find(
            (msg) => msg.embedStreams[0].identifier === liveStream.link,
          );
          const lm = liveMessage?.embedStreams[0];

          if (lm && this.shouldUpdateEmbed(lm, liveStream)) {
            messagePromises.push(
              this.dependencies.discordClient.updateMessage({
                channelId,
                messageId: liveMessage.rawId,
                embeds: [createStreamEmbed(liveStream)],
              }),
            );
          }

          if (!liveMessage) {
            messagePromises.push(
              this.dependencies.discordClient.sendMessage({
                channelId,
                content: "",
                embeds: [createStreamEmbed(liveStream)],
              }),
            );
          }
        }

        // Messages to be deleted
        const deletedMessages = liveMessages.filter(
          (msg) =>
            !liveStreams.some((v) => v.link === msg.embedStreams[0].identifier),
        );
        for (const msg of deletedMessages) {
          messagePromises.push(
            this.dependencies.discordClient.deleteMessage({
              channelId,
              messageId: msg.rawId,
            }),
          );
        }

        if (upcomingStreams.length === 0) {
          const deletedMessageId = upcomingMessage?.rawId;
          if (deletedMessageId) {
            messagePromises.push(
              this.dependencies.discordClient.deleteMessage({
                channelId,
                messageId: deletedMessageId,
              }),
            );
          }
        }

        const processedResults =
          await this.processBatchedPromises(messagePromises);

        const failedResults = processedResults.filter(
          (r): r is PromiseRejectedResult => r.status === "rejected",
        );

        if (failedResults.length > 0) {
          AppLogger.warn("Some message operations failed", {
            service: this.SERVICE_NAME,
            channelId,
            failedCount: failedResults.length,
            errors: failedResults.map((r) => r.reason),
          });
        }

        return Ok();
      });

      const results = await this.processBatchedPromises(promises);

      const failedResults = results.filter(
        (r): r is PromiseRejectedResult => r.status === "rejected",
      );

      if (failedResults.length > 0) {
        AppLogger.warn("Some message operations failed", {
          service: this.SERVICE_NAME,
          channelCount: options.channelIds.length,
          failedCount: failedResults.length,
          errors: failedResults.map((r) => r.reason),
        });
      }

      AppLogger.info("Successfully sent messages to all channels", {
        service: this.SERVICE_NAME,
        successCount: results.filter((r) => r.status === "fulfilled").length,
        failureCount: failedResults.length,
      });
      return Ok();
    });
  }

  /**
   * Adjust the channels the bot participates in.
   */
  async adjustBotChannel(
    options: BotChannelAdjustmentParams,
  ): Promise<Result<DiscordServer, AppError>> {
    AppLogger.info("Adjusting bot channel", {
      service: this.SERVICE_NAME,
      type: options.type,
      serverId: options.serverId,
      channelId: options.targetChannelId,
      channelLangaugeCode: options.channelLangaugeCode,
      serverLangaugeCode: options.serverLangaugeCode,
      memberType: options.memberType,
    });

    let server: DiscordServer;

    const serverExists = await this.dependencies.discordServerRepository.exists(
      {
        serverId: options.serverId,
      },
    );
    if (serverExists.err) {
      AppLogger.error("Failed to check server existence", {
        service: this.SERVICE_NAME,
        serverId: options.serverId,
        error: serverExists.err,
      });
      return serverExists;
    }

    if (!serverExists.val) {
      const currentTime = getCurrentUTCString();
      server = createDiscordServer({
        id: createUUID(),
        rawId: options.serverId,
        name: "",
        languageCode: "default",
        discordChannels: [],
        createdAt: currentTime,
        updatedAt: currentTime,
      });
    } else {
      const serverResult = await this.dependencies.discordServerRepository.get({
        serverId: options.serverId,
      });
      if (serverResult.err) {
        AppLogger.error("Failed to get server", {
          service: this.SERVICE_NAME,
          serverId: options.serverId,
          error: serverResult.err,
        });
        return serverResult;
      }
      server = serverResult.val;
    }

    let channels = server.discordChannels;

    switch (options.type) {
      case "add": {
        const channelResult = await this.dependencies.discordClient.getChannel({
          serverId: options.serverId,
          channelId: options.targetChannelId,
        });
        if (channelResult.err) {
          AppLogger.error("Failed to get channel info", {
            service: this.SERVICE_NAME,
            serverId: options.serverId,
            channelId: options.targetChannelId,
            error: channelResult.err,
          });
          return channelResult;
        }
        // Overwrite channel language code if specified
        channelResult.val.languageCode =
          options.channelLangaugeCode ?? channelResult.val.languageCode;
        // Overwrite server language code if specified
        server.languageCode = options.serverLangaugeCode ?? server.languageCode;

        const existingIndex = channels.findIndex(
          (ch) => ch.rawId === channelResult.val.rawId,
        );

        if (existingIndex >= 0) {
          // Update existing channel information
          channels[existingIndex] = {
            ...channelResult.val,
            id: channels[existingIndex].id,
            languageCode:
              options.channelLangaugeCode ??
              channels[existingIndex].languageCode,
            memberType:
              options.memberType ?? channels[existingIndex].memberType,
          };
        } else {
          // Add new channel
          channels.push({
            ...channelResult.val,
            memberType: options.memberType ?? "vspo_all",
            isInitialAdd: true,
          });
        }
        break;
      }
      case "remove": {
        channels = channels.filter(
          (ch) => ch.rawId !== options.targetChannelId,
        );
        break;
      }
    }

    const updatedServer = discordServer.parse({
      ...server,
      discordChannels: channels,
    });

    AppLogger.debug("Successfully adjusted bot channel", {
      service: this.SERVICE_NAME,
      type: options.type,
      serverId: options.serverId,
      channelId: options.targetChannelId,
      updatedServer: updatedServer,
    });

    // set channel list to cache
    const r = await this.dependencies.cacheClient.set(
      cacheKey.discord(options.serverId),
      updatedServer,
      // Limit
      2147483647,
    );
    if (r.err) {
      AppLogger.error("Failed to set channel list to cache", {
        service: this.SERVICE_NAME,
        serverId: options.serverId,
        error: r.err,
      });
    }

    return Ok(updatedServer);
  }

  /**
   * Delete all bot messages in a channel.
   */
  async deleteAllMessagesInChannel(
    channelId: string,
  ): Promise<Result<void, AppError>> {
    AppLogger.info("Deleting all messages in channel", {
      service: this.SERVICE_NAME,
      channelId,
    });

    const adminMessagesResult =
      await this.dependencies.discordMessageRepository.list({
        channelId,
        limit: 10,
        page: 0,
      });
    if (adminMessagesResult.err) {
      AppLogger.error("Failed to get admin messages", {
        service: this.SERVICE_NAME,
        channelId,
        error: adminMessagesResult.err,
      });
    }
    const adminMessages =
      adminMessagesResult.val?.filter((msg) => msg.type === "admin") ?? [];
    AppLogger.info("Admin messages", {
      service: this.SERVICE_NAME,
      channelId,
      adminMessages: adminMessages,
    });
    const botMessagesResult =
      await this.dependencies.discordClient.getLatestBotMessages(channelId);
    if (botMessagesResult.err) {
      AppLogger.error("Failed to get bot messages", {
        service: this.SERVICE_NAME,
        channelId,
        error: botMessagesResult.err,
      });
      return botMessagesResult;
    }

    const deletePromises = botMessagesResult.val
      .filter((msg) => !adminMessages.some((am) => am.rawId === msg.rawId))
      .map((msg) =>
        this.dependencies.discordClient.deleteMessage({
          channelId,
          messageId: msg.rawId,
        }),
      );

    const p = await this.processBatchedPromises(deletePromises);

    const failedResults = p.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );

    if (failedResults.length > 0) {
      AppLogger.warn("Some message deletions failed", {
        service: this.SERVICE_NAME,
        channelId,
        failedCount: failedResults.length,
        errors: failedResults.map((r) => r.reason),
      });
    }

    AppLogger.info("Successfully deleted messages", {
      service: this.SERVICE_NAME,
      channelId,
      successCount: p.filter((r) => r.status === "fulfilled").length,
      failureCount: failedResults.length,
    });
    return Ok();
  }

  async sendAdminMessage(
    message: SendAdminMessageParams,
  ): Promise<Result<string, AppError>> {
    return await withTracerResult(
      "DiscordService",
      "sendAdminMessage",
      async () => {
        AppLogger.debug("Sending admin message", {
          service: this.SERVICE_NAME,
          channelId: message.channelId,
          content: message.content,
        });
        const r = await this.dependencies.discordClient.sendMessage({
          channelId: message.channelId,
          content: message.content,
          embeds: [],
        });
        if (r.err) {
          AppLogger.error("Failed to send admin message", {
            service: this.SERVICE_NAME,
            channelId: message.channelId,
            error: r.err,
          });
          return r;
        }
        AppLogger.debug("Successfully sent admin message", {
          service: this.SERVICE_NAME,
          channelId: message.channelId,
          messageId: r.val,
        });
        return Ok(r.val);
      },
    );
  }

  async isDeletedChannel(
    options: DeletedChannelCheckParams,
  ): Promise<Result<boolean, AppError>> {
    return await withTracerResult(
      "DiscordService",
      "isDeletedChannel",
      async () => {
        const channelResult = await this.dependencies.discordClient.getChannel({
          serverId: options.serverId,
          channelId: options.channelId,
        });

        if (channelResult.err) {
          if (
            channelResult.err.code === "NOT_FOUND" ||
            channelResult.err.code === "FORBIDDEN"
          ) {
            AppLogger.info("Channel is deleted", {
              service: this.SERVICE_NAME,
              channelId: options.channelId,
              serverId: options.serverId,
            });
            return Ok(true);
          }
          return Err(channelResult.err);
        }
        return Ok(false);
      },
    );
  }
  /**
   * Check if an embed needs to be updated by comparing key properties.
   */
  private shouldUpdateEmbed(
    embed: { title: string; thumbnail: string; startedAt: string },
    stream: Stream,
  ): boolean {
    return (
      embed.title !== stream.title ||
      embed.thumbnail !== stream.thumbnailURL ||
      embed.startedAt !== stream.formattedStartedAt
    );
  }
}
