import { google, type youtube_v3 } from "googleapis";
import {
  type Channels,
  createChannel,
  createChannels,
} from "../../domain/channel";
import { type Videos, createVideo, createVideos } from "../../domain/video";
import { getCurrentUTCString } from "../../pkg/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "../../pkg/errors";
import { withTracerResult } from "../http/trace/cloudflare";

type GetVideosParams = {
  videoIds: string[];
};

export const query = {
  VSPO_JP: "ぶいすぽ",
  VSPO_JP_CLIP: "ぶいすぽ 切り抜き",
  VSPO_EN: "vspo",
  VSPO_EN_CLIP: "vspo clips",
} as const;

export type QueryKeys = (typeof query)[keyof typeof query];

export type SearchVideosParams = {
  query: QueryKeys;
  eventType: "completed" | "live" | "upcoming";
};

export type GetChannelsParams = {
  channelIds: string[];
};

export type GetVideosByChannelParams = {
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
  getVideos(params: GetVideosParams): Promise<Result<Videos, AppError>>;
  searchVideos(params: SearchVideosParams): Promise<Result<Videos, AppError>>;
  getChannels(params: GetChannelsParams): Promise<Result<Channels, AppError>>;
  getVideosByChannel(
    params: GetVideosByChannelParams,
  ): Promise<Result<Videos, AppError>>;
}

export class YoutubeService implements IYoutubeService {
  private youtube: youtube_v3.Youtube;

  constructor(apiKey: string) {
    this.youtube = google.youtube({
      version: "v3",
      auth: apiKey,
    });
  }

  async getVideos(params: GetVideosParams): Promise<Result<Videos, AppError>> {
    return withTracerResult("YoutubeService", "getVideos", async (span) => {
      const chunks = this.chunkArray(params.videoIds, 50);
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
        createVideos(
          videos.map((video) =>
            createVideo({
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
              status: this.determineVideoStatus(video),
              tags: video.snippet?.tags || [],
              viewCount: Number.parseInt(
                video.statistics?.viewCount || "0",
                10,
              ),
              thumbnailURL:
                video.snippet?.thumbnails?.medium?.url ||
                video.snippet?.thumbnails?.standard?.url ||
                video.snippet?.thumbnails?.default?.url ||
                video.snippet?.thumbnails?.maxres?.url ||
                video.snippet?.thumbnails?.high?.url ||
                "",
              videoType: "vspo_stream",
            }),
          ),
        ),
      );
    });
  }

  async searchVideos(
    params: SearchVideosParams,
  ): Promise<Result<Videos, AppError>> {
    return withTracerResult("YoutubeService", "searchVideos", async (span) => {
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
        createVideos(
          response.data.items?.map((video) =>
            createVideo({
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
              videoType: "vspo_stream",
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

  async getVideosByChannel(
    params: GetVideosByChannelParams,
  ): Promise<Result<Videos, AppError>> {
    return withTracerResult(
      "YoutubeService",
      "getVideosByChannel",
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
          createVideos(
            response.data.items?.map((video) =>
              createVideo({
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
                status: this.determineVideoStatus(video),
                tags: [],
                viewCount: 0,
                thumbnailURL:
                  video.snippet?.thumbnails?.medium?.url ||
                  video.snippet?.thumbnails?.standard?.url ||
                  video.snippet?.thumbnails?.default?.url ||
                  video.snippet?.thumbnails?.maxres?.url ||
                  video.snippet?.thumbnails?.high?.url ||
                  "",
                videoType: "vspo_stream",
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

  private determineVideoStatus(
    video: youtube_v3.Schema$Video | youtube_v3.Schema$SearchResult,
  ): "live" | "upcoming" | "ended" {
    // For SearchResult objects, we only have liveBroadcastContent
    if ("snippet" in video && !("liveStreamingDetails" in video)) {
      if (video.snippet?.liveBroadcastContent === "live") {
        return "live";
      }

      if (video.snippet?.liveBroadcastContent === "upcoming") {
        return "upcoming";
      }

      return "ended";
    }

    // For Video objects, we have more detailed information
    // If actualEndTime exists, always mark as ended
    if (
      "liveStreamingDetails" in video &&
      video.liveStreamingDetails?.actualEndTime
    ) {
      return "ended";
    }

    // If actualStartTime exists but actualEndTime doesn't, it's live
    if (
      "liveStreamingDetails" in video &&
      video.liveStreamingDetails?.actualStartTime &&
      !video.liveStreamingDetails?.actualEndTime
    ) {
      return "live";
    }

    // If scheduledEndTime is in the future, it's upcoming
    if (
      "liveStreamingDetails" in video &&
      video.liveStreamingDetails?.scheduledEndTime &&
      new Date(video.liveStreamingDetails.scheduledEndTime) > new Date()
    ) {
      return "upcoming";
    }

    // Fall back to the original logic based on liveBroadcastContent
    if (video.snippet?.liveBroadcastContent === "live") {
      return "live";
    }

    if (video.snippet?.liveBroadcastContent === "upcoming") {
      return "upcoming";
    }

    return "ended";
  }
}
