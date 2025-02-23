import { type Videos, createVideo, createVideos } from "../../domain/video";
import { convertToUTC } from "../../pkg/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "../../pkg/errors";
import { withTracer } from "../http/trace/cloudflare";

export type TwitcastingUser = {
  id: string;
};

export type TwitcastingMovie = {
  id: string;
  title: string;
  is_live: boolean;
  total_view_count: number;
  large_thumbnail: string;
  created: number;
  user: TwitcastingUser;
};

type TwitcastingMoviesResponse = {
  movies: TwitcastingMovie[];
};

type GetVideosParams = {
  userIds: string[];
};

export type TwitCastingVideo = {
  id: string;
  userId: string;
  title: string;
  isLive: boolean;
  viewCount: number;
  thumbnailURL: string;
  startedAt: number;
};

export interface ITwitcastingService {
  getVideos(params: GetVideosParams): Promise<Result<Videos, AppError>>;
}

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === "object" && value !== null;
}

function hasMoviesProperty(
  obj: Record<PropertyKey, unknown>,
): obj is { movies: unknown } {
  return Object.prototype.hasOwnProperty.call(obj, "movies");
}

function isMoviesArray(obj: { movies: unknown }): obj is { movies: unknown[] } {
  return Array.isArray(obj.movies);
}

function isValidMoviesResponse(
  data: unknown,
): data is TwitcastingMoviesResponse {
  if (!isObject(data)) {
    return false;
  }
  if (!hasMoviesProperty(data)) {
    return false;
  }
  if (!isMoviesArray(data)) {
    return false;
  }
  return true;
}

export class TwitcastingService implements ITwitcastingService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getVideos(params: GetVideosParams): Promise<Result<Videos, AppError>> {
    return withTracer("TwitcastingService", "getVideos", async (span) => {
      let allVideos: Videos = createVideos([]);

      for (const userId of params.userIds) {
        const result = await this.fetchUserVideos(userId);
        if (result.err) {
          return Err(result.err);
        }
        allVideos = createVideos([
          ...allVideos,
          ...result.val.map((video) => this.createVideoModel(video)),
        ]);
      }

      return Ok(allVideos);
    });
  }

  private async fetchUserVideos(
    userId: string,
  ): Promise<Result<TwitCastingVideo[], AppError>> {
    return withTracer("TwitcastingService", "fetchUserVideos", async (span) => {
      const fetchPromise = fetch(
        `https://apiv2.twitcasting.tv/users/${userId}/movies?limit=3`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      const responseResult = await wrap(
        fetchPromise,
        (err) =>
          new AppError({
            message: `Network error while fetching videos for user ${userId}: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );
      if (responseResult.err) {
        return responseResult;
      }

      const response = responseResult.val;
      if (!response.ok) {
        return Err(
          new AppError({
            message: `Failed to fetch videos for user ${userId}: ${response.status} ${response.statusText || "Unauthorized"}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
        );
      }

      const dataResult = await wrap(
        response.json(),
        (err) =>
          new AppError({
            message: `Failed to parse JSON response for user ${userId}: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );
      if (dataResult.err) {
        return dataResult;
      }

      const data = dataResult.val;
      if (!isValidMoviesResponse(data)) {
        return Err(
          new AppError({
            message: `Invalid response format for user ${userId}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
        );
      }

      const videos = data.movies.map((movie) =>
        this.mapToTwitCastingVideo(movie),
      );
      return Ok(videos);
    });
  }

  private mapToTwitCastingVideo(movie: TwitcastingMovie): TwitCastingVideo {
    return {
      id: movie.id,
      userId: movie.user.id,
      title: movie.title,
      isLive: movie.is_live,
      viewCount: movie.total_view_count,
      thumbnailURL: movie.large_thumbnail,
      startedAt: movie.created,
    };
  }

  private createVideoModel(video: TwitCastingVideo) {
    // Convert UNIX timestamp to ISO string
    const startedAt = new Date(video.startedAt * 1000).toISOString();

    return createVideo({
      id: "",
      rawId: video.id,
      rawChannelID: video.userId,
      languageCode: "default",
      title: video.title,
      description: video.title,
      publishedAt: startedAt,
      startedAt: startedAt,
      endedAt: null,
      platform: "twitcasting",
      status: video.isLive ? "live" : "ended",
      tags: [],
      viewCount: video.viewCount,
      thumbnailURL: video.thumbnailURL,
      videoType: "vspo_stream",
    });
  }
}
