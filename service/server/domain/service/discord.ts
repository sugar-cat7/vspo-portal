import * as Sentry from "@sentry/cloudflare";
import type { IDiscordServerRepository, IVideoRepository } from "../../infra";
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
  channelIds: string[];
};

// Parameters for adjusting the bot's channels
type BotChannelAdjustmentParams = {
  type: "add" | "remove";
  serverId: string;
  targetChannelId: string;
  serverLangaugeCode?: string;
  channelLangaugeCode?: string;
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
}

export class DiscordService implements IDiscordService {
  private readonly SERVICE_NAME = "DiscordService";

  // Constructor with dependency injection
  constructor(
    private readonly dependencies: {
      discordClient: IDiscordClient;
      discordServerRepository: IDiscordServerRepository;
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

    const videoListResult = await this.dependencies.videoRepository.list({
      limit: 100,
      page: 0,
      languageCode: options.channelLangaugeCode,
      videoType: "vspo_stream",
      startedAt: convertToUTCDate(
        getCurrentUTCDate().setDate(getCurrentUTCDate().getDate() - 1),
      ),
    });
    if (videoListResult.err) {
      AppLogger.error("Failed to fetch video list", {
        service: this.SERVICE_NAME,
        error: videoListResult.err,
      });
      return Err(videoListResult.err);
    }

    const liveVideos = videoListResult.val.filter(
      (video) => video.status === "live",
    );
    const upcomingVideos = videoListResult.val.filter(
      (video) => video.status === "upcoming",
    );

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

      const messagePromises: Promise<Result<void, AppError>>[] = [];

      // Find existing upcoming message (there should be at most one)
      const upcomingMessage = latestMessagesResult.val.find((msg) =>
        msg.embedVideos.some((video) => video.status === "upcoming"),
      );

      // Find all live messages
      const liveMessages = latestMessagesResult.val.filter((msg) =>
        msg.embedVideos.some((video) => video.status === "live"),
      );

      // Process live messages
      for (const msg of liveMessages) {
        const videoInMessage = msg.embedVideos[0]; // Live messages have only one embed
        const currentVideo = liveVideos.find(
          (v) => v.link === videoInMessage.identifier,
        );

        if (currentVideo && currentVideo.status === "live") {
          // Case: Message is live, Video is still live
          // Action: Update if needed
          if (this.shouldUpdateEmbed(videoInMessage, currentVideo)) {
            messagePromises.push(
              this.dependencies.discordClient.updateMessage({
                channelId,
                messageId: msg.rawId,
                embeds: [createVideoEmbed(currentVideo)],
              }),
            );
          }
        } else if (currentVideo && currentVideo.status === "upcoming") {
          // Case: Message is live, Video is now upcoming
          // Action: Delete live message, add to upcoming message
          messagePromises.push(
            this.dependencies.discordClient.deleteMessage({
              channelId,
              messageId: msg.rawId,
            }),
          );

          // Will handle adding to upcoming message later
        } else {
          // Case: Message is live, Video is ended or not found
          // Action: Delete the message
          messagePromises.push(
            this.dependencies.discordClient.deleteMessage({
              channelId,
              messageId: msg.rawId,
            }),
          );
        }
      }

      // Process upcoming message
      if (upcomingMessage) {
        const upcomingVideosInMessage = upcomingMessage.embedVideos;
        const upcomingVideoIdentifiers = upcomingVideosInMessage.map(
          (v) => v.identifier,
        );

        // Check which videos in the message are now live
        const nowLiveVideos = upcomingVideosInMessage.filter((video) => {
          const matchingVideo = videoListResult.val.find(
            (v) => v.link === video.identifier,
          );
          return matchingVideo && matchingVideo.status === "live";
        });

        // Check which videos in the message are still upcoming
        const stillUpcomingVideos = upcomingVideosInMessage.filter((video) => {
          const matchingVideo = videoListResult.val.find(
            (v) => v.link === video.identifier,
          );
          return matchingVideo && matchingVideo.status === "upcoming";
        });

        // Check which videos in the message need updates
        const needsUpdate = stillUpcomingVideos.some((video) => {
          const matchingVideo = upcomingVideos.find(
            (v) => v.link === video.identifier,
          );
          return matchingVideo && this.shouldUpdateEmbed(video, matchingVideo);
        });

        // Find new upcoming videos not in the message
        const newUpcomingVideos = upcomingVideos.filter(
          (video) => !upcomingVideoIdentifiers.includes(video.link),
        );

        // Handle videos that changed from upcoming to live
        for (const video of nowLiveVideos) {
          const matchingVideo = liveVideos.find(
            (v) => v.link === video.identifier,
          );
          if (matchingVideo) {
            // Send a new live message for this video
            messagePromises.push(
              this.dependencies.discordClient.sendMessage({
                channelId,
                content: "",
                embeds: [createVideoEmbed(matchingVideo)],
              }),
            );
          }
        }

        // Update or delete the upcoming message
        const remainingUpcomingVideos = [
          ...upcomingVideos.filter((video) =>
            stillUpcomingVideos.some((v) => v.identifier === video.link),
          ),
          ...newUpcomingVideos,
        ].sort(
          (a, b) =>
            new Date(a.startedAt || "").getTime() -
            new Date(b.startedAt || "").getTime(),
        );

        if (remainingUpcomingVideos.length > 0) {
          // If there are still upcoming videos, update the message
          if (
            needsUpdate ||
            newUpcomingVideos.length > 0 ||
            nowLiveVideos.length > 0
          ) {
            messagePromises.push(
              this.dependencies.discordClient.updateMessage({
                channelId,
                messageId: upcomingMessage.rawId,
                embeds: remainingUpcomingVideos.map((video) =>
                  createVideoEmbed(video),
                ),
              }),
            );
          }
        } else {
          // If no upcoming videos remain, delete the message
          messagePromises.push(
            this.dependencies.discordClient.deleteMessage({
              channelId,
              messageId: upcomingMessage.rawId,
            }),
          );
        }
      } else if (upcomingVideos.length > 0) {
        // No existing upcoming message but we have upcoming videos
        // Create a new upcoming message
        messagePromises.push(
          this.dependencies.discordClient.sendMessage({
            channelId,
            content: "",
            embeds: upcomingVideos.map((video) => createVideoEmbed(video)),
          }),
        );
      }

      // Send new live messages for videos not already covered
      const existingLiveVideoIds = liveMessages
        .map((msg) => msg.embedVideos[0]?.identifier)
        .filter(Boolean);

      const newLiveVideos = liveVideos.filter(
        (video) => !existingLiveVideoIds.includes(video.link),
      );

      for (const video of newLiveVideos) {
        messagePromises.push(
          this.dependencies.discordClient.sendMessage({
            channelId,
            content: "",
            embeds: [createVideoEmbed(video)],
          }),
        );
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
          };
        } else {
          // Add new channel
          channels.push(channelResult.val);
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

    AppLogger.info("Successfully adjusted bot channel", {
      service: this.SERVICE_NAME,
      type: options.type,
      serverId: options.serverId,
      channelId: options.targetChannelId,
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

    const deletePromises = botMessagesResult.val.map((msg) =>
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
