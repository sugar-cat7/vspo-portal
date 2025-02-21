import type { Channel } from "../../domain/channel";
import type { Video } from "../../domain/video";
import type {
  ITwitcastingService,
  ITwitchService,
  IYoutubeService,
} from "../../infra";
import type {
  TwitCastingVideo,
  TwitcastingMovie,
} from "../../infra/twitcasting";
import { type AppError, Ok, type Result } from "../../pkg/errors";
import { testChannel } from "../fixtures/video";

export class MockYoutubeService implements IYoutubeService {
  youtube = null;
  chunkArray = () => [];

  async getChannels(params: { channelIds: string[] }): Promise<
    Result<Channel[], AppError>
  > {
    return Ok([testChannel]);
  }

  async getVideos(params: { videoIds: string[] }): Promise<
    Result<Video[], AppError>
  > {
    return Ok([]);
  }

  async searchVideos(params: {
    query: string;
    eventType: "completed" | "live" | "upcoming";
  }): Promise<Result<Video[], AppError>> {
    return Ok([]);
  }
}

export class MockTwitchService implements ITwitchService {
  baseUrl = "";
  accessToken = "";
  config = { clientId: "", clientSecret: "" };

  async getAccessToken(): Promise<string> {
    return "";
  }

  async fetchFromTwitch<T>(): Promise<Result<T, AppError>> {
    return Ok({} as T);
  }

  async getStreams(params: { userIds: string[] }): Promise<
    Result<Video[], AppError>
  > {
    return Ok([]);
  }

  async getVideosByIDs(params: { videoIds: string[] }): Promise<
    Result<Video[], AppError>
  > {
    return Ok([]);
  }
}

export class MockTwitcastingService implements ITwitcastingService {
  accessToken = "";

  async fetchUserVideos(
    userId: string,
  ): Promise<Result<TwitCastingVideo[], AppError>> {
    return Ok([]);
  }

  async mapToTwitCastingVideo(
    movie: TwitcastingMovie,
  ): Promise<TwitCastingVideo> {
    return {} as TwitCastingVideo;
  }

  async createVideoModel(video: TwitCastingVideo): Promise<Video> {
    return {} as Video;
  }

  async getVideos(params: { userIds: string[] }): Promise<
    Result<Video[], AppError>
  > {
    return Ok([]);
  }
}
