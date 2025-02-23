import * as Sentry from "@sentry/cloudflare";
import { withTracer } from "../../infra/http/trace/cloudflare";
import type { IDiscordServerRepository, IVideoRepository } from "../../infra";
import type { IDiscordClient } from "../../infra/discord";
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

// Parameters for sending a live video message to a channel
type LiveVideoChannelParams = {
  channelId: string;
  targetMessageId?: string;
  content: string;
  liveVideo: Video;
};

// Parameters for sending upcoming video messages to a channel
type UpcomingVideoChannelParams = {
  channelId: string;
  latestDiscordMessages: DiscordMessages;
  upcomingVideos: Videos;
};

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

//
// DiffResult now includes an optional messageId for "create" actions.
// We use the diff to indicate if a message should be created, updated, or deleted.
//
type DiffResult = Array<
  | { kind: "create"; video: Video; messageId?: string }
  | { kind: "delete"; messageId: string }
  | { kind: "remove"; videoIdentifier: string; messageId: string }
  | { kind: "update"; video: Video; messageId?: string }
>;

// Parameters for generating diff messages for live updates
type LiveDiffMessagesParams = {
  channelId: string;
  channelLangaugeCode: string;
  latestDiscordMessages: DiscordMessages;
  videos: Videos;
};

type ChannelDiffResult =
  | {
      type: "success";
      channelId: string;
      channelLangaugeCode: string;
      diff: DiffResult;
    }
  | {
      type: "error";
      channelId: string;
      channelLangaugeCode: string;
      error: AppError;
    };

export interface IDiscordService {
  sendChannelLiveDiffResults(
    params: ChannelDiffResult[],
  ): Promise<Result<void, AppError>>;
  sendLiveVideosToChannel(
    params: LiveVideoChannelParams,
  ): Promise<Result<void, AppError>>;
  getLiveDiffMessages(
    params: LiveDiffMessagesParams,
  ): Promise<Result<DiffResult, AppError>>;
  sendMessagesToChannel(
    params: ChannelMessageParams,
  ): Promise<Result<void, AppError>>;
  sendUpcomingVideosToChannel(
    params: UpcomingVideoChannelParams,
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
   * Process diff results and send or delete messages accordingly.
   * Upcoming videos are sorted by their startedAt time.
   */
  async sendChannelLiveDiffResults(
    channelDiffResults: ChannelDiffResult[],
  ): Promise<Result<void, AppError>> {
    return withTracer(
      this.SERVICE_NAME,
      "sendChannelLiveDiffResults",
      async (span) => {
        span.setAttributes({
          channelCount: channelDiffResults.length,
        });
        AppLogger.info("Processing channel diff results", {
          service: this.SERVICE_NAME,
          channelCount: channelDiffResults.length,
        });

        // Iterate through each channel diff result
        for (const channelResult of channelDiffResults) {
          if (channelResult.type === "success") {
            AppLogger.info("Processing diff items for channel", {
              service: this.SERVICE_NAME,
              channelId: channelResult.channelId,
              diffCount: channelResult.diff.length,
            });

            for (const diffItem of channelResult.diff) {
              switch (diffItem.kind) {
                case "create": {
                  if (diffItem.video.status === "live") {
                    // Always create a new message for live videos
                    const result = await this.sendLiveVideosToChannel({
                      channelId: channelResult.channelId,
                      content: "",
                      liveVideo: diffItem.video,
                    });
                    if (result.err) {
                      AppLogger.error("Failed to send live video message", {
                        service: this.SERVICE_NAME,
                        channelId: channelResult.channelId,
                        error: result.err,
                      });
                      return Err(result.err);
                    }
                  }
                  break;
                }
                case "update": {
                  if (diffItem.video.status === "live") {
                    // Always create a new message for live videos even for updates
                    const result = await this.sendLiveVideosToChannel({
                      channelId: channelResult.channelId,
                      content: "",
                      liveVideo: diffItem.video,
                      targetMessageId: diffItem.messageId,
                    });
                    if (result.err) {
                      AppLogger.error("Failed to update live video message", {
                        service: this.SERVICE_NAME,
                        channelId: channelResult.channelId,
                        error: result.err,
                      });
                      return Err(result.err);
                    }
                  }
                  break;
                }
                case "delete": {
                  const result =
                    await this.dependencies.discordClient.deleteMessage({
                      channelId: channelResult.channelId,
                      messageId: diffItem.messageId,
                    });
                  if (result.err) {
                    AppLogger.error("Failed to delete message", {
                      service: this.SERVICE_NAME,
                      channelId: channelResult.channelId,
                      messageId: diffItem.messageId,
                      error: result.err,
                    });
                    return Err(result.err);
                  }
                  break;
                }
              }
            }
          }
        }

        AppLogger.info("Successfully processed all channel diff results", {
          service: this.SERVICE_NAME,
        });
        return Ok();
      },
    );
  }

  /**
   * Send a live video message to a channel.
   * For live videos, always send a new message regardless of targetMessageId.
   */
  async sendLiveVideosToChannel(
    options: LiveVideoChannelParams,
  ): Promise<Result<void, AppError>> {
    return withTracer(
      this.SERVICE_NAME,
      "sendLiveVideosToChannel",
      async (span) => {
        span.setAttributes({
          channelId: options.channelId,
          videoStatus: options.liveVideo.status,
          targetMessageId: options.targetMessageId,
        });
        
        AppLogger.info("Sending live video to channel", {
          service: this.SERVICE_NAME,
          channelId: options.channelId,
          videoStatus: options.liveVideo.status,
        });

        const embed = createVideoEmbed(options.liveVideo);
        if (options.liveVideo.status === "live") {
          // Always create a new message for live videos
          const result = await this.dependencies.discordClient.sendMessage({
            channelId: options.channelId,
            content: options.content,
            embeds: [embed],
          });
          if (result.err) {
            AppLogger.error("Failed to send live video message", {
              service: this.SERVICE_NAME,
              channelId: options.channelId,
              error: result.err,
            });
            return Err(result.err);
          }
          return Ok();
        }
        // For non-live videos, update if targetMessageId is provided
        const result = options.targetMessageId
          ? await this.dependencies.discordClient.updateMessage({
              channelId: options.channelId,
              messageId: options.targetMessageId,
              content: options.content,
              embeds: [embed],
            })
          : await this.dependencies.discordClient.sendMessage({
              channelId: options.channelId,
              content: options.content,
              embeds: [embed],
            });
        if (result.err) {
          AppLogger.error("Failed to send/update video message", {
            service: this.SERVICE_NAME,
            channelId: options.channelId,
            targetMessageId: options.targetMessageId,
            error: result.err,
          });
          return Err(result.err);
        }
        return Ok();
      },
    );
  }

  /**
   * Generate diff results by comparing current bot messages with local videos.
   * Compares the stored embed status with the current video status.
   */
  async getLiveDiffMessages(
    options: LiveDiffMessagesParams,
  ): Promise<Result<DiffResult, AppError>> {
    return withTracer(
      this.SERVICE_NAME,
      "getLiveDiffMessages",
      async (span) => {
        span.setAttributes({
          channelId: options.channelId,
          channelLanguageCode: options.channelLangaugeCode,
          videoCount: options.videos.length,
        });

        AppLogger.info("Generating live diff messages", {
          service: this.SERVICE_NAME,
          channelId: options.channelId,
          videoCount: options.videos.length,
        });

        // Extract embed information from bot messages
        const existingEmbeds = options.latestDiscordMessages.flatMap((msg) =>
          msg.embedVideos.map((embed) => ({
            messageId: msg.rawId,
            identifier: embed.identifier,
            title: embed.title,
            thumbnail: embed.thumbnail,
            startedAt: embed.startedAt,
            status: embed.status,
          })),
        );

        const diffItems: DiffResult = [];

        // Compare each embed with local videos
        for (const embed of existingEmbeds) {
          for (const video of options.videos) {
            if (embed.identifier === video.link) {
              switch (embed.status) {
                case "live": {
                  if (video.status === "live") {
                    // If live video and update is needed, update embed
                    if (this.shouldUpdateEmbed(embed, video)) {
                      diffItems.push({
                        kind: "update",
                        video,
                        messageId: embed.messageId,
                      });
                    }
                    break;
                  }
                  // If video status changed from live, delete the message
                  diffItems.push({
                    kind: "delete",
                    messageId: embed.messageId,
                  });
                  break;
                }
                case "upcoming": {
                  if (video.status === "live") {
                    // Transition from upcoming to live:
                    // Remove the old embed and create a new message
                    diffItems.push({
                      kind: "remove",
                      messageId: embed.messageId,
                      videoIdentifier: embed.identifier,
                    });
                    diffItems.push({
                      kind: "create",
                      video,
                    });
                    break;
                  }
                }
              }
            }
          }
        }

        // Create new messages for videos not present in existing embeds
        for (const video of options.videos) {
          const exists = existingEmbeds.some(
            (embed) => embed.identifier === video.link,
          );
          if (!exists && video.status === "live") {
            diffItems.push({
              kind: "create",
              video,
            });
          }
        }

        AppLogger.info("Generated diff messages", {
          service: this.SERVICE_NAME,
          diffCount: diffItems.length,
        });
        return Ok(diffItems);
      },
    );
  }

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

      const upcomingResult = await this.sendUpcomingVideosToChannel({
        channelId,
        latestDiscordMessages: latestMessagesResult.val,
        upcomingVideos: videoListResult.val.filter(
          (video) => video.status === "upcoming",
        ),
      });
      if (upcomingResult.err) {
        AppLogger.error("Failed to send upcoming videos", {
          service: this.SERVICE_NAME,
          channelId,
          error: upcomingResult.err,
        });
        return upcomingResult;
      }

      const liveDiffResult = await this.getLiveDiffMessages({
        channelId,
        channelLangaugeCode: options.channelLangaugeCode,
        latestDiscordMessages: latestMessagesResult.val,
        videos: videoListResult.val,
      });
      if (liveDiffResult.err) {
        AppLogger.error("Failed to get live diff messages", {
          service: this.SERVICE_NAME,
          channelId,
          error: liveDiffResult.err,
        });
        return liveDiffResult;
      }

      const diffSendResult = await this.sendChannelLiveDiffResults([
        {
          type: "success",
          channelId,
          channelLangaugeCode: options.channelLangaugeCode,
          diff: liveDiffResult.val,
        },
      ]);
      if (diffSendResult.err) {
        AppLogger.error("Failed to send channel live diff results", {
          service: this.SERVICE_NAME,
          channelId,
          error: diffSendResult.err,
        });
        return diffSendResult;
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
   * Send upcoming video messages to a channel.
   * If a target message exists, update it; otherwise, send a new message.
   */
  async sendUpcomingVideosToChannel(
    options: UpcomingVideoChannelParams,
  ): Promise<Result<void, AppError>> {
    AppLogger.info("Sending upcoming videos to channel", {
      service: this.SERVICE_NAME,
      channelId: options.channelId,
      videoCount: options.upcomingVideos.length,
    });

    // Extract upcoming video embeds from bot messages
    const upcomingEmbeds = options.latestDiscordMessages
      .flatMap((msg) =>
        msg.embedVideos.map((embed) => ({
          messageId: msg.rawId,
          identifier: embed.identifier,
          title: embed.title,
          thumbnail: embed.thumbnail,
          startedAt: embed.startedAt,
          status: embed.status,
        })),
      )
      .filter((embed) => embed.status === "upcoming");

    // Determine if an update is required for upcoming videos
    const shouldUpdate =
      options.upcomingVideos.length > 0
        ? options.upcomingVideos.every((video) => {
            const embed = upcomingEmbeds.find(
              (e) => e.identifier === video.link,
            );
            return embed ? this.shouldUpdateEmbed(embed, video) : false;
          })
        : false;

    if (shouldUpdate) {
      const messageId = upcomingEmbeds.at(0)?.messageId;
      if (messageId) {
        const result = await this.dependencies.discordClient.updateMessage({
          messageId,
          channelId: options.channelId,
          content: "",
          embeds: options.upcomingVideos.map((video) =>
            createVideoEmbed(video),
          ),
        });
        if (result.err) {
          AppLogger.error("Failed to update upcoming videos message", {
            service: this.SERVICE_NAME,
            channelId: options.channelId,
            messageId,
            error: result.err,
          });
          return Err(result.err);
        }
        return Ok();
      }
      const result = await this.dependencies.discordClient.sendMessage({
        channelId: options.channelId,
        content: "",
        embeds: options.upcomingVideos.map((video) => createVideoEmbed(video)),
      });
      if (result.err) {
        AppLogger.error("Failed to send upcoming videos message", {
          service: this.SERVICE_NAME,
          channelId: options.channelId,
          error: result.err,
        });
        return Err(result.err);
      }
      return Ok();
    }

    if (upcomingEmbeds.length === 0) {
      const result = await this.dependencies.discordClient.sendMessage({
        channelId: options.channelId,
        content: "",
        embeds: options.upcomingVideos.map((video) => createVideoEmbed(video)),
      });
      if (result.err) {
        AppLogger.error("Failed to send initial upcoming videos message", {
          service: this.SERVICE_NAME,
          channelId: options.channelId,
          error: result.err,
        });
        return Err(result.err);
      }
      return Ok();
    }

    if (options.upcomingVideos.length === 0) {
      const result = await this.dependencies.discordClient.deleteMessage({
        channelId: options.channelId,
        messageId: upcomingEmbeds[0].messageId,
      });
      if (result.err) {
        AppLogger.error("Failed to delete upcoming videos message", {
          service: this.SERVICE_NAME,
          channelId: options.channelId,
          messageId: upcomingEmbeds[0].messageId,
          error: result.err,
        });
        return Err(result.err);
      }
      return Ok();
    }

    if (upcomingEmbeds.length !== options.upcomingVideos.length) {
      const result = await this.dependencies.discordClient.updateMessage({
        messageId: upcomingEmbeds[0].messageId,
        channelId: options.channelId,
        content: "",
        embeds: options.upcomingVideos.map((video) => createVideoEmbed(video)),
      });
      if (result.err) {
        AppLogger.error("Failed to update upcoming videos count", {
          service: this.SERVICE_NAME,
          channelId: options.channelId,
          messageId: upcomingEmbeds[0].messageId,
          error: result.err,
        });
        return Err(result.err);
      }
      return Ok();
    }

    AppLogger.info("Successfully processed upcoming videos", {
      service: this.SERVICE_NAME,
      channelId: options.channelId,
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
