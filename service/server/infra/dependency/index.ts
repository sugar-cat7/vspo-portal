import { CreatorService, VideoService } from "../../domain";
import {
  CreatorRepository,
  DB,
  ITxManager,
  TxManager,
  VideoRepository,
} from "../repository";
import { ITwitcastingService, TwitcastingService } from "../twitcasting";
import { ITwitchService, TwitchService } from "../twitch";
import { IYoutubeService, YoutubeService } from "../youtube";
import { PgTransactionConfig } from "drizzle-orm/pg-core";
import { AppError, Result } from "../../pkg/errors";

import { VideoInteractor, CreatorInteractor } from "../../usecase";
import { AppEnv } from "../../config/env";

export interface IRepositories {
  creatorRepository: CreatorRepository;
  videoRepository: VideoRepository;
}

export function createRepositories(tx: DB): IRepositories {
  return {
    creatorRepository: new CreatorRepository(tx),
    videoRepository: new VideoRepository(tx),
  };
}

export interface IServices {
  creatorService: CreatorService;
  videoService: VideoService;
}

export function createServices(
  repos: IRepositories,
  youtubeClient: IYoutubeService,
  twitchClient: ITwitchService,
  twitcastingClient: ITwitcastingService
): IServices {
  return {
    creatorService: new CreatorService({
      youtubeClient,
      creatorRepository: repos.creatorRepository,
    }),
    videoService: new VideoService({
      youtubeClient,
      twitchClient,
      twitCastingClient: twitcastingClient,
      creatorRepository: repos.creatorRepository,
      videoRepository: repos.videoRepository,
    }),
  };
}

export interface IAppContext {
  runInTx<T>(
    operation: (
      repos: IRepositories,
      services: IServices
    ) => Promise<Result<T, AppError>>
  ): Promise<Result<T, AppError>>;
}

export class AppContext implements IAppContext {
  constructor(
    private readonly txManager: ITxManager,
    private readonly youtubeClient: IYoutubeService,
    private readonly twitchClient: ITwitchService,
    private readonly twitcastingClient: ITwitcastingService
  ) {}

  async runInTx<T>(
    operation: (
      repos: IRepositories,
      services: IServices
    ) => Promise<Result<T, AppError>>,
    config?: PgTransactionConfig
  ): Promise<Result<T, AppError>> {
    return this.txManager.runTx(async (tx) => {
      const repos = createRepositories(tx);

      const services = createServices(
        repos,
        this.youtubeClient,
        this.twitchClient,
        this.twitcastingClient
      );

      return operation(repos, services);
    }, config);
  }
}

export class Container {
  private readonly youtubeService: YoutubeService;
  private readonly twitchService: TwitchService;
  private readonly twitcastingService: TwitcastingService;
  private readonly txManager: TxManager;
  creatorInteractor: CreatorInteractor;
  videoInteractor: VideoInteractor;

  constructor(private readonly env: AppEnv) {
    this.youtubeService = new YoutubeService(this.env.YOUTUBE_API_KEY);
    this.twitchService = new TwitchService({
      clientId: this.env.TWITCH_CLIENT_ID,
      clientSecret: this.env.TWITCH_CLIENT_SECRET,
    });
    this.twitcastingService = new TwitcastingService(
      this.env.TWITCASTING_ACCESS_TOKEN
    );
    this.txManager = new TxManager({
      connectionString:
        this.env.ENVIRONMENT === "local"
          ? this.env.DEV_DB_CONNECTION_STRING
          : this.env.DB.connectionString,
      isQueryLoggingEnabled: this.env.ENVIRONMENT === "local"? true : false,
    });
    const context = new AppContext(
      this.txManager,
      this.youtubeService,
      this.twitchService,
      this.twitcastingService
    );
    this.creatorInteractor = new CreatorInteractor(context);
    this.videoInteractor = new VideoInteractor(context);
  }
}
