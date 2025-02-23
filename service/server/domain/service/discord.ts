import * as Sentry from "@sentry/cloudflare";
import type { IDiscordServerRepository, IVideoRepository } from "../../infra";
import type { IDiscordClient } from "../../infra/discord";
import { withTracerResult } from "../../infra/http/trace/cloudflare";
import { getCurrentUTCString } from "../../pkg/dayjs";
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

      // Processing for already sent messages
      for (const msg of latestMessagesResult.val) {
        // Update already sent upcoming messages
        const upcomingVideosInMessage = msg.embedVideos.filter(
          (video) => video.status === "upcoming",
        );
        if (upcomingVideosInMessage.length === 0) continue;

        // Collect identifiers of existing videos
        const currentVideoIdentifiers = upcomingVideosInMessage.map(
          (v) => v.identifier,
        );

        // Find existing videos that are still marked as upcoming
        const stillUpcomingVideos = currentVideoIdentifiers.filter(
          (identifier) => upcomingVideos.some((v) => v.link === identifier),
        );

        // Find new videos (videos not included in existing identifiers)
        const newUpcomingVideos = upcomingVideos.filter(
          (video) => !currentVideoIdentifiers.includes(video.link),
        );

        // Check if an update is needed:
        // 1. Existing videos need updates
        // 2. There are new videos
        // 3. Some existing videos have disappeared (started, canceled, etc.)
        const needsUpdate = upcomingVideosInMessage.some((video) => {
          const matchingVideo = upcomingVideos.find(
            (v) => v.link === video.identifier,
          );
          return matchingVideo && this.shouldUpdateEmbed(video, matchingVideo);
        });

        if (
          needsUpdate ||
          newUpcomingVideos.length > 0 ||
          stillUpcomingVideos.length < currentVideoIdentifiers.length
        ) {
          // Combine update information of existing videos with new videos
          const updatedEmbeds = [
            // Update existing videos that are still marked as upcoming
            ...upcomingVideos
              .filter((video) => stillUpcomingVideos.includes(video.link))
              .map((video) => createVideoEmbed(video)),
            // Add new videos
            ...newUpcomingVideos.map((video) => createVideoEmbed(video)),
          ];

          messagePromises.push(
            this.dependencies.discordClient.updateMessage({
              channelId,
              messageId: msg.rawId,
              embeds: updatedEmbeds,
            }),
          );
        }

        // Update already sent live messages
        const liveVideosInMessage = msg.embedVideos.filter(
          (video) => video.status === "live",
        );
        if (liveVideosInMessage.length === 0) continue;

        const videoToUpdate = liveVideosInMessage[0];
        const matchingVideo = liveVideos.find(
          (v) => v.link === videoToUpdate.identifier,
        );

        if (
          matchingVideo &&
          this.shouldUpdateEmbed(videoToUpdate, matchingVideo)
        ) {
          messagePromises.push(
            this.dependencies.discordClient.updateMessage({
              channelId,
              messageId: msg.rawId,
              embeds: [createVideoEmbed(matchingVideo)],
            }),
          );
        }

        // Delete already ended or removed live messages
        if (!matchingVideo || matchingVideo.status === "ended") {
          messagePromises.push(
            this.dependencies.discordClient.deleteMessage({
              channelId,
              messageId: msg.rawId,
            }),
          );
        }
      }

      // Messages that have not been sent yet
      // live
      const liveVideosToSend = liveVideos.filter(
        (video) =>
          !latestMessagesResult.val.some(
            (msg) => msg?.embedVideos.at(0)?.identifier === video.link,
          ),
      );

      for (const video of liveVideosToSend) {
        messagePromises.push(
          this.dependencies.discordClient.sendMessage({
            channelId,
            content: "",
            embeds: [createVideoEmbed(video)],
          }),
        );
      }

      // No upcoming messages exist
      if (
        latestMessagesResult.val.every((msg) =>
          msg.embedVideos?.every((video) => video.status === "live"),
        )
      ) {
        messagePromises.push(
          this.dependencies.discordClient.sendMessage({
            channelId,
            content: "",
            embeds: upcomingVideos.map(createVideoEmbed),
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
