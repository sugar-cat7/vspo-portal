import type { Channel } from "../../domain/channel";
import type { Clip } from "../../domain/clip";
import type { Stream } from "../../domain/stream";
import type {
  ITwitcastingService,
  ITwitchService,
  IYoutubeService,
  SearchClipsParams,
} from "../../infra";
import type {
  TwitCastingStream,
  TwitcastingMovie,
} from "../../infra/twitcasting";
import { type AppError, Ok, type Result } from "../../pkg/errors";

export class MockYoutubeService implements IYoutubeService {
  youtube = null;
  chunkArray = () => [];

  async getChannels(params: { channelIds: string[] }): Promise<
    Result<Channel[], AppError>
  > {
    return Ok([]);
  }

  async getStreams(params: { streamIds: string[] }): Promise<
    Result<Stream[], AppError>
  > {
    return Ok([]);
  }

  async searchStreams(params: {
    query: string;
    eventType: "completed" | "live" | "upcoming";
  }): Promise<Result<Stream[], AppError>> {
    return Ok([]);
  }

  async getStreamsByChannel(params: {
    channelId: string;
    maxResults?: number;
    order?:
      | "date"
      | "rating"
      | "relevance"
      | "title"
      | "videoCount"
      | "viewCount";
  }): Promise<Result<Stream[], AppError>> {
    return Ok([]);
  }

  async searchClips(
    params: SearchClipsParams,
  ): Promise<Result<Clip[], AppError>> {
    return Ok([]);
  }

  async getClips(params: { videoIds: string[] }): Promise<
    Result<Clip[], AppError>
  > {
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
    Result<Stream[], AppError>
  > {
    return Ok([]);
  }

  async getStreamsByIDs(params: { streamIds: string[] }): Promise<
    Result<Stream[], AppError>
  > {
    return Ok([]);
  }

  async getArchive(params: { userIds: string[] }): Promise<
    Result<Stream[], AppError>
  > {
    return Ok([]);
  }

  async getClipsByUserID(params: { userId: string }): Promise<
    Result<Clip[], AppError>
  > {
    return Ok([]);
  }
}

export class MockTwitcastingService implements ITwitcastingService {
  accessToken = "";

  async fetchUserStreams(
    userId: string,
  ): Promise<Result<TwitCastingStream[], AppError>> {
    return Ok([]);
  }

  async mapToTwitCastingStream(
    movie: TwitcastingMovie,
  ): Promise<TwitCastingStream> {
    return {} as TwitCastingStream;
  }

  async createStreamModel(video: TwitCastingStream): Promise<Stream> {
    return {} as Stream;
  }

  async getStreams(params: { userIds: string[] }): Promise<
    Result<Stream[], AppError>
  > {
    return Ok([]);
  }
}
