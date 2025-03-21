import { type Videos, createVideo, createVideos } from "../../domain/video";
import { convertToUTC } from "../../pkg/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "../../pkg/errors";
import { withTracerResult } from "../http/trace/cloudflare";
import type { paths } from "./twitch-api.generated";

type TwitchServiceConfig = {
  clientId: string;
  clientSecret: string;
};

type GetStreamsParams = { userIds: string[] };
type GetVideosByIDsParams = { videoIds: string[] };
type GetArchiveParams = { userIds: string[] };
export interface ITwitchService {
  getStreams(params: GetStreamsParams): Promise<Result<Videos, AppError>>;
  getVideosByIDs(
    params: GetVideosByIDsParams,
  ): Promise<Result<Videos, AppError>>;
  getArchive(params: GetArchiveParams): Promise<Result<Videos, AppError>>;
}

export class TwitchService implements ITwitchService {
  private baseUrl = "https://api.twitch.tv/helix";
  private accessToken: string | null = null;

  constructor(private config: TwitchServiceConfig) {}

  private async getAccessToken(): Promise<Result<string, AppError>> {
    return withTracerResult("TwitchService", "getAccessToken", async (span) => {
      if (this.accessToken) return Ok(this.accessToken);

      const result = await wrap(
        fetch(
          `https://id.twitch.tv/oauth2/token?client_id=${this.config.clientId}&client_secret=${this.config.clientSecret}&grant_type=client_credentials`,
          {
            method: "POST",
          },
        ),
        (err) =>
          new AppError({
            message: `Failed to get access token: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );

      if (result.err) return Err(result.err);
      if (!result.val.ok) {
        const data = (await result.val.json()) as {
          error?: string;
          error_description?: string;
        };
        return Err(
          new AppError({
            message: `Twitch API error: ${data.error || ""}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
        );
      }

      const data = await wrap(
        result.val.json() as Promise<{ access_token: string }>,
        (err) =>
          new AppError({
            message: `Failed to parse access token response: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );

      if (data.err) return Err(data.err);
      this.accessToken = data.val.access_token;
      return Ok(data.val.access_token);
    });
  }

  private async fetchFromTwitch<T>(
    endpoint: string,
    params: Record<string, string | string[]>,
  ): Promise<Result<T, AppError>> {
    return withTracerResult(
      "TwitchService",
      "fetchFromTwitch",
      async (span) => {
        const tokenResult = await this.getAccessToken();
        if (tokenResult.err) return Err(tokenResult.err);

        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (Array.isArray(value)) {
            for (const v of value) {
              queryParams.append(key, v);
            }
          } else {
            queryParams.append(key, value);
          }
        }

        const result = await wrap(
          fetch(`${this.baseUrl}${endpoint}?${queryParams.toString()}`, {
            headers: {
              "Client-ID": this.config.clientId,
              Authorization: `Bearer ${tokenResult.val}`,
            },
          }),
          (err) =>
            new AppError({
              message: `Network error: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (result.err) return Err(result.err);
        if (!result.val.ok) {
          const data = (await result.val.json()) as {
            error?: string;
            error_description?: string;
          };
          return Err(
            new AppError({
              message: `Twitch API error: ${data.error || ""}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
          );
        }

        const data = await wrap(
          result.val.json() as Promise<T>,
          (err) =>
            new AppError({
              message: `Failed to parse response: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (data.err) return Err(data.err);
        return Ok(data.val);
      },
    );
  }

  async getStreams(
    params: GetStreamsParams,
  ): Promise<Result<Videos, AppError>> {
    return withTracerResult("TwitchService", "getStreams", async (span) => {
      type StreamsResponse =
        paths["/streams"]["get"]["responses"]["200"]["content"]["application/json"];
      const result = await this.fetchFromTwitch<StreamsResponse>("/streams", {
        user_id: params.userIds,
        type: "live",
      });

      if (result.err) return Err(result.err);

      return Ok(
        createVideos(
          result.val.data.map((stream) =>
            createVideo({
              id: "",
              rawId: stream.id,
              rawChannelID: stream.user_id,
              languageCode: "default",
              title: stream.title,
              description: stream.title,
              publishedAt: convertToUTC(stream.started_at),
              startedAt: convertToUTC(stream.started_at),
              endedAt: null,
              platform: "twitch",
              status: "live",
              tags: stream.tags || [],
              viewCount: stream.viewer_count,
              thumbnailURL: stream.thumbnail_url,
              videoType: "vspo_stream",
              link: `https://www.twitch.tv/${stream.user_login}`,
            }),
          ),
        ),
      );
    });
  }

  async getVideosByIDs(
    params: GetVideosByIDsParams,
  ): Promise<Result<Videos, AppError>> {
    return withTracerResult("TwitchService", "getVideosByIDs", async (span) => {
      type VideosResponse =
        paths["/videos"]["get"]["responses"]["200"]["content"]["application/json"];
      const result = await this.fetchFromTwitch<VideosResponse>("/videos", {
        id: params.videoIds,
      });

      if (result.err) return Err(result.err);

      return Ok(
        createVideos(
          result.val.data.map((video) =>
            createVideo({
              id: "",
              rawId: video.id,
              rawChannelID: video.user_id,
              languageCode: "default",
              title: video.title,
              description: video.description,
              publishedAt: convertToUTC(video.published_at),
              startedAt: convertToUTC(video.created_at),
              endedAt: null,
              platform: "twitch",
              status: "ended",
              tags: [],
              viewCount: 0,
              thumbnailURL: video.thumbnail_url,
              videoType: "vspo_stream",
            }),
          ),
        ),
      );
    });
  }

  async getArchive(
    params: GetArchiveParams,
  ): Promise<Result<Videos, AppError>> {
    return withTracerResult("TwitchService", "getArchive", async (span) => {
      type ArchiveResponse =
        paths["/videos"]["get"]["responses"]["200"]["content"]["application/json"];

      const promises = params.userIds.map(async (uid) => {
        return this.fetchFromTwitch<ArchiveResponse>("/videos", {
          user_id: uid,
          period: "week",
          type: "archive",
        });
      });

      const settledResults = await Promise.allSettled(promises);

      // Collect only successful results
      const successfulVideos = settledResults
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<
            Result<ArchiveResponse, AppError>
          > => result.status === "fulfilled",
        )
        .flatMap((result) => {
          // Only use results that don't have errors
          if (result.value.err) return [];
          return result.value.val.data;
        })
        .filter((video) => video.type === "archive")
        .map((video) =>
          createVideo({
            id: "",
            rawId: video.id,
            rawChannelID: video.user_id,
            languageCode: "default",
            title: video.title,
            description: video.description,
            publishedAt: convertToUTC(video.published_at),
            startedAt: convertToUTC(video.created_at),
            endedAt: null,
            platform: "twitch",
            status: "ended",
            tags: [],
            viewCount: 0,
            thumbnailURL: video.thumbnail_url,
            videoType: "vspo_stream",
            link: `https://www.twitch.tv/videos/${video.id}`,
          }),
        );

      return Ok(createVideos(successfulVideos));
    });
  }
}
