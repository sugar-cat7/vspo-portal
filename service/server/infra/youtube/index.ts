import { google, type youtube_v3 } from "googleapis";
import {
  type Channels,
  createChannel,
  createChannels,
} from "../../domain/channel";
import { type Videos, createVideo, createVideos } from "../../domain/video";
import { getCurrentUTCString } from "../../pkg/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "../../pkg/errors";

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

export interface IYoutubeService {
  getVideos(params: GetVideosParams): Promise<Result<Videos, AppError>>;
  searchVideos(params: SearchVideosParams): Promise<Result<Videos, AppError>>;
  getChannels(params: GetChannelsParams): Promise<Result<Channels, AppError>>;
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
    console.log("videos", JSON.stringify(videos, null, 2));
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
            status:
              video.snippet?.liveBroadcastContent === "live"
                ? "live"
                : video.snippet?.liveBroadcastContent === "upcoming"
                  ? "upcoming"
                  : "ended",
            tags: video.snippet?.tags || [],
            viewCount: Number.parseInt(video.statistics?.viewCount || "0", 10),
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
  }

  async searchVideos(
    params: SearchVideosParams,
  ): Promise<Result<Videos, AppError>> {
    const responseResult = await wrap(
      this.youtube.search.list({
        part: ["snippet"],
        q: params.query,
        maxResults: 50,
        eventType: params.eventType,
        type: ["video"],
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
            rawChannelID: video.snippet?.channelId || "",
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
  }

  async getChannels(
    params: GetChannelsParams,
  ): Promise<Result<Channels, AppError>> {
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
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }
}
