import * as Sentry from "@sentry/cloudflare";
import type {
  IDiscordMessageRepository,
  IDiscordServerRepository,
  IVideoRepository,
} from "../../infra";
import type { IDiscordClient } from "../../infra/discord";
import { withTracerResult } from "../../infra/http/trace/cloudflare";
import {
  convertToUTCDate,
  getCurrentUTCDate,
  getCurrentUTCString,
} from "../../pkg/dayjs";
import { type AppError, Err, Ok, type Result } from "../../pkg/errors";
import { AppLogger } from "../../pkg/logging";
import { createUUID } from "../../pkg/uuid";
import {
  DiscordMessage,
  type DiscordMessages,
  type DiscordServer,
  createDiscordServer,
  createVideoEmbed,
  discordServer,
} from "../discord";
import type { Video, Videos } from "../video";

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
      videoRepository: IVideoRepository;
    },
  ) {}
  /**
   * Send messages to multiple channels.
   * This includes upcoming video messages and live diff messages.
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

    const liveVideoListResult = await this.dependencies.videoRepository.list({
      limit: 1000,
      page: 0,
      languageCode: options.channelLangaugeCode,
      videoType: "vspo_stream",
      startedAt: convertToUTCDate(
        getCurrentUTCDate().setDate(getCurrentUTCDate().getDate() - 1),
      ),
      memberType: options.channelMemberType,
      status: "live",
      orderBy: "desc",
    });
    if (liveVideoListResult.err) {
      AppLogger.error("Failed to fetch video list", {
        service: this.SERVICE_NAME,
        error: liveVideoListResult.err,
      });
      return Err(liveVideoListResult.err);
    }

    const liveVideos = liveVideoListResult.val;

    liveVideos.sort((a, b) => {
      return (
        new Date(a.startedAt || "").getTime() -
        new Date(b.startedAt || "").getTime()
      );
    });

    const upcomingVideoListResult =
      await this.dependencies.videoRepository.list({
        limit: 1000,
        page: 0,
        languageCode: options.channelLangaugeCode,
        videoType: "vspo_stream",
        startedAt: convertToUTCDate(
          getCurrentUTCDate().setDate(getCurrentUTCDate().getDate() - 1),
        ),
        memberType: options.channelMemberType,
        status: "upcoming",
        orderBy: "desc",
      });
    if (upcomingVideoListResult.err) {
      AppLogger.error("Failed to fetch video list", {
        service: this.SERVICE_NAME,
        error: upcomingVideoListResult.err,
      });
      return Err(upcomingVideoListResult.err);
    }
    const upcomingVideos = upcomingVideoListResult.val;

    // Sort upcoming videos by broadcast start time in ascending order
    upcomingVideos.sort((a, b) => {
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
        msg.embedVideos.some((video) => video.status === "upcoming"),
      );

      // Find all live messages
      const liveMessages = latestMessagesResult.val.filter((msg) =>
        msg.embedVideos.some((video) => video.status === "live"),
      );

      // Process upcoming message
      if (upcomingMessage) {
        const upcomingVideosInMessage = upcomingMessage.embedVideos;

        // Check if there is a difference between the embedded upcoming videos and the latest upcoming videos
        const hasDiff =
          upcomingVideos.some((v) => {
            return !upcomingVideosInMessage.some(
              (v2) => v2.identifier === v.link,
            );
          }) ||
          upcomingVideosInMessage.some((v) => {
            return !upcomingVideos.some((v2) => v2.link === v.identifier);
          });

        if (hasDiff) {
          messagePromises.push(
            this.dependencies.discordClient.updateMessage({
              channelId,
              messageId: upcomingMessage.rawId,
              embeds: upcomingVideos.map((video) => createVideoEmbed(video)),
            }),
          );
        }
      } else {
        if (upcomingVideos.length > 0) {
          messagePromises.push(
            this.dependencies.discordClient.sendMessage({
              channelId,
              content: "",
              embeds: upcomingVideos.map((video) => createVideoEmbed(video)),
            }),
          );
        }
      }

      for (const liveVideo of liveVideos) {
        const liveMessage = liveMessages.find(
          (msg) => msg.embedVideos[0].identifier === liveVideo.link,
        );
        const lm = liveMessage?.embedVideos[0];

        if (lm && this.shouldUpdateEmbed(lm, liveVideo)) {
          messagePromises.push(
            this.dependencies.discordClient.updateMessage({
              channelId,
              messageId: liveMessage.rawId,
              embeds: [createVideoEmbed(liveVideo)],
            }),
          );
        }

        if (!liveMessage) {
          messagePromises.push(
            this.dependencies.discordClient.sendMessage({
              channelId,
              content: "",
              embeds: [createVideoEmbed(liveVideo)],
            }),
          );
        }
      }

      // Messages to be deleted
      const deletedMessages = liveMessages.filter(
        (msg) =>
          !liveVideos.some((v) => v.link === msg.embedVideos[0].identifier),
      );
      for (const msg of deletedMessages) {
        messagePromises.push(
          this.dependencies.discordClient.deleteMessage({
            channelId,
            messageId: msg.rawId,
          }),
        );
      }

      if (upcomingVideos.length === 0) {
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

      const results = await Promise.allSettled(messagePromises);
      const failedResults = results.filter(
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

    const p = await Promise.allSettled(promises);
    if (span) {
      const error = p.filter((r) => r.status === "rejected");
      span.setAttributes({
        "error.count": error.length,
        "error.messages": error.map((e) => e.reason).join(", "),
      });
    }

    AppLogger.info("Successfully sent messages to all channels", {
      service: this.SERVICE_NAME,
      successCount: p.filter((r) => r.status === "fulfilled").length,
      failureCount: p.filter((r) => r.status === "rejected").length,
    });
    return Ok();
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

    const results = await Promise.allSettled(deletePromises);
    const failedResults = results.filter(
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
      successCount: results.filter((r) => r.status === "fulfilled").length,
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
    video: Video,
  ): boolean {
    return (
      embed.title !== video.title ||
      embed.thumbnail !== video.thumbnailURL ||
      embed.startedAt !== video.formattedStartedAt
    );
  }
}
