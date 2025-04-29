import { google, type youtube_v3 } from "googleapis";
import {
  type Channels,
  createChannel,
  createChannels,
} from "../../domain/channel";
import { type Streams, createStream, createStreams } from "../../domain/stream";
import { getCurrentUTCString } from "../../pkg/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "../../pkg/errors";
import { AppLogger } from "../../pkg/logging";
import { withTracerResult } from "../http/trace/cloudflare";

type GetStreamsParams = {
  streamIds: string[];
};

export const query = {
  VSPO_JP: "ぶいすぽ",
  VSPO_JP_CLIP: "ぶいすぽ 切り抜き",
  VSPO_EN: "vspo",
  VSPO_EN_CLIP: "vspo clips",
} as const;

export type QueryKeys = (typeof query)[keyof typeof query];

export type SearchStreamsParams = {
  query: QueryKeys;
  eventType: "completed" | "live" | "upcoming";
};

export type GetChannelsParams = {
  channelIds: string[];
};

export type GetStreamsByChannelParams = {
  channelId: string;
  maxResults?: number;
  order?:
    | "date"
    | "rating"
    | "relevance"
    | "title"
    | "videoCount"
    | "viewCount";
  eventType?: "completed" | "live" | "upcoming";
};

export interface IYoutubeService {
  getStreams(params: GetStreamsParams): Promise<Result<Streams, AppError>>;
  searchStreams(
    params: SearchStreamsParams,
  ): Promise<Result<Streams, AppError>>;
  getChannels(params: GetChannelsParams): Promise<Result<Channels, AppError>>;
  getStreamsByChannel(
    params: GetStreamsByChannelParams,
  ): Promise<Result<Streams, AppError>>;
}

export class YoutubeService implements IYoutubeService {
  private youtube: youtube_v3.Youtube;

  constructor(apiKey: string) {
    this.youtube = google.youtube({
      version: "v3",
      auth: apiKey,
    });
  }

  async getStreams(
    params: GetStreamsParams,
  ): Promise<Result<Streams, AppError>> {
    return withTracerResult("YoutubeService", "getStreams", async (span) => {
      AppLogger.info("getStreams", {
        streamIds: params.streamIds,
      });
      const chunks = this.chunkArray(params.streamIds, 50);
      const videos: youtube_v3.Schema$Video[] = [];
      for (const chunk of chunks) {
        const responseResult = await wrap(
          this.youtube.videos.list({
            part: ["snippet", "liveStreamingDetails", "statistics"],
            id: chunk,
          }),
          (err) =>
            new AppError({
              message: `Network error while fetching videos: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );
        if (responseResult.err) {
          return Err(responseResult.err);
        }

        const response = responseResult.val;
        videos.push(...(response.data.items || []));
      }
      return Ok(
        createStreams(
          videos.map((video) =>
            createStream({
              id: "",
              rawId: video.id || "",
              rawChannelID: video.snippet?.channelId || "",
              title: video.snippet?.title || "",
              languageCode: "default",
              description: video.snippet?.description || "",
              publishedAt: video.snippet?.publishedAt || getCurrentUTCString(),
              startedAt:
                video.liveStreamingDetails?.actualStartTime ||
                video.liveStreamingDetails?.scheduledStartTime ||
                null,
              endedAt:
                video.liveStreamingDetails?.actualEndTime ||
                video.liveStreamingDetails?.scheduledEndTime ||
                null,
              platform: "youtube",
              status: this.determineStreamStatus(video),
              tags: video.snippet?.tags || [],
              viewCount: Number.parseInt(
                video.statistics?.viewCount || "0",
                10,
              ),
              thumbnailURL:
                video.snippet?.thumbnails?.high?.url ||
                video.snippet?.thumbnails?.standard?.url ||
                video.snippet?.thumbnails?.medium?.url ||
                video.snippet?.thumbnails?.default?.url ||
                video.snippet?.thumbnails?.maxres?.url ||
                "",
            }),
          ),
        ),
      );
    });
  }

  async searchStreams(
    params: SearchStreamsParams,
  ): Promise<Result<Streams, AppError>> {
    return withTracerResult("YoutubeService", "searchStreams", async (span) => {
      const responseResult = await wrap(
        this.youtube.search.list({
          part: ["snippet"],
          q: params.query,
          maxResults: 50,
          eventType: params.eventType,
          type: ["video"],
          safeSearch: "none",
          order: "relevance",
        }),
        (err) =>
          new AppError({
            message: `Network error while searching videos: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );

      if (responseResult.err) {
        return Err(responseResult.err);
      }

      const response = responseResult.val;
      return Ok(
        createStreams(
          response.data.items?.map((video) =>
            createStream({
              id: "",
              rawId: video.id?.videoId || "",
              languageCode: "default",
              title: video.snippet?.title || "",
              description: video.snippet?.description || "",
              rawChannelID:
                video.snippet?.channelId || video.id?.channelId || "",
              publishedAt: video.snippet?.publishedAt || getCurrentUTCString(),
              startedAt: null,
              endedAt: null,
              platform: "youtube",
              status: params.eventType === "live" ? "live" : "upcoming",
              tags: [],
              viewCount: 0,
              thumbnailURL:
                video.snippet?.thumbnails?.default?.url ||
                video.snippet?.thumbnails?.standard?.url ||
                "",
            }),
          ) || [],
        ),
      );
    });
  }

  async getChannels(
    params: GetChannelsParams,
  ): Promise<Result<Channels, AppError>> {
    return withTracerResult("YoutubeService", "getChannels", async (span) => {
      const chunks = this.chunkArray(params.channelIds, 50);
      const channels: youtube_v3.Schema$Channel[] = [];

      for (const chunk of chunks) {
        const responseResult = await wrap(
          this.youtube.channels.list({
            part: ["snippet"],
            id: chunk,
          }),
          (err) =>
            new AppError({
              message: `Network error while fetching channels: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (responseResult.err) {
          return Err(responseResult.err);
        }

        const response = responseResult.val;
        channels.push(...(response.data.items || []));
      }

      return Ok(
        createChannels(
          channels.map((channel) =>
            createChannel({
              id: channel.id || "",
              creatorID: "",
              youtube: {
                rawId: channel.id || "",
                name: channel.snippet?.title || "",
                description: channel.snippet?.description || "",
                thumbnailURL:
                  channel.snippet?.thumbnails?.default?.url ||
                  channel.snippet?.thumbnails?.standard?.url ||
                  "",
                publishedAt: channel.snippet?.publishedAt || null,
                subscriberCount: 0,
              },
              twitch: null,
              twitCasting: null,
              niconico: null,
            }),
          ),
        ),
      );
    });
  }

  async getStreamsByChannel(
    params: GetStreamsByChannelParams,
  ): Promise<Result<Streams, AppError>> {
    return withTracerResult(
      "YoutubeService",
      "getStreamsByChannel",
      async (span) => {
        const option: youtube_v3.Params$Resource$Search$List = {
          part: ["snippet"],
          channelId: params.channelId,
          maxResults: 50,
          order: "date",
          type: ["video"],
        };

        if (params.eventType) {
          option.eventType = params.eventType;
        }

        if (params.order) {
          option.order = params.order;
        }

        if (params.maxResults) {
          option.maxResults = params.maxResults;
        }

        const responseResult = await wrap(
          this.youtube.search.list(option),
          (err) =>
            new AppError({
              message: `Network error while fetching videos by channel: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (responseResult.err) {
          return Err(responseResult.err);
        }

        const response = responseResult.val;
        return Ok(
          createStreams(
            response.data.items?.map((video) =>
              createStream({
                id: "",
                rawId: video.id?.videoId || "",
                languageCode: "default",
                title: video.snippet?.title || "",
                description: video.snippet?.description || "",
                rawChannelID: video.snippet?.channelId || "",
                publishedAt:
                  video.snippet?.publishedAt || getCurrentUTCString(),
                startedAt: null,
                endedAt: null,
                platform: "youtube",
                status: this.determineStreamStatus(video),
                tags: [],
                viewCount: 0,
                thumbnailURL:
                  video.snippet?.thumbnails?.medium?.url ||
                  video.snippet?.thumbnails?.standard?.url ||
                  video.snippet?.thumbnails?.default?.url ||
                  video.snippet?.thumbnails?.maxres?.url ||
                  video.snippet?.thumbnails?.high?.url ||
                  "",
              }),
            ) || [],
          ),
        );
      },
    );
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  private determineStreamStatus(
    video: youtube_v3.Schema$Video | youtube_v3.Schema$SearchResult,
  ): "live" | "upcoming" | "ended" | "unknown" {
    if (video?.snippet?.liveBroadcastContent) {
      if (video.snippet.liveBroadcastContent === "live") {
        return "live";
      }

      if (video.snippet.liveBroadcastContent === "upcoming") {
        return "upcoming";
      }
    }

    if ("liveStreamingDetails" in video) {
      if (video?.liveStreamingDetails?.actualEndTime) {
        return "ended";
      }

      if (
        video?.liveStreamingDetails?.actualStartTime &&
        !video?.liveStreamingDetails?.actualEndTime
      ) {
        return "live";
      }

      if (
        video?.liveStreamingDetails?.scheduledStartTime &&
        !video.liveStreamingDetails?.actualStartTime
      ) {
        return "upcoming";
      }
    }

    return "unknown";
  }
}
