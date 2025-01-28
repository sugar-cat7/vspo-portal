import type { PgTransactionConfig } from "drizzle-orm/pg-core";
import {
  CreatorService,
  type ICreatorService,
  type IVideoService,
  VideoService,
} from "../../domain";
import type { AppError, Result } from "../../pkg/errors";
import {
  CreatorRepository,
  type DB,
  type ITxManager,
  TxManager,
  VideoRepository,
} from "../repository";
import { type ITwitcastingService, TwitcastingService } from "../twitcasting";
import { type ITwitchService, TwitchService } from "../twitch";
import { type IYoutubeService, YoutubeService } from "../youtube";

import type { AppWorkerEnv } from "../../config/env/internal";
import { CreatorInteractor, VideoInteractor } from "../../usecase";
import { AIService, type IAIService } from "../ai";

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
  creatorService: ICreatorService;
  videoService: IVideoService;
}

export function createServices(
  repos: IRepositories,
  youtubeClient: IYoutubeService,
  twitchClient: ITwitchService,
  twitcastingClient: ITwitcastingService,
  aiService: IAIService,
): IServices {
  return {
    creatorService: new CreatorService({
      youtubeClient,
      creatorRepository: repos.creatorRepository,
      aiService,
    }),
    videoService: new VideoService({
      youtubeClient,
      twitchClient,
      twitCastingClient: twitcastingClient,
      creatorRepository: repos.creatorRepository,
      videoRepository: repos.videoRepository,
      aiService,
    }),
  };
}

export interface IAppContext {
  runInTx<T>(
    operation: (
      repos: IRepositories,
      services: IServices,
    ) => Promise<Result<T, AppError>>,
  ): Promise<Result<T, AppError>>;
}

export class AppContext implements IAppContext {
  constructor(
    private readonly txManager: ITxManager,
    private readonly youtubeClient: IYoutubeService,
    private readonly twitchClient: ITwitchService,
    private readonly twitcastingClient: ITwitcastingService,
    private readonly aiService: IAIService,
  ) {}

  async runInTx<T>(
    operation: (
      repos: IRepositories,
      services: IServices,
    ) => Promise<Result<T, AppError>>,
    config?: PgTransactionConfig,
  ): Promise<Result<T, AppError>> {
    return this.txManager.runTx(async (tx) => {
      const repos = createRepositories(tx);

      const services = createServices(
        repos,
        this.youtubeClient,
        this.twitchClient,
        this.twitcastingClient,
        this.aiService,
      );

      return operation(repos, services);
    }, config);
  }
}

export class Container {
  private readonly youtubeService: IYoutubeService;
  private readonly twitchService: ITwitchService;
  private readonly twitcastingService: ITwitcastingService;
  private readonly aiService: IAIService;
  private readonly txManager: TxManager;
  creatorInteractor: CreatorInteractor;
  videoInteractor: VideoInteractor;

  constructor(private readonly env: AppWorkerEnv) {
    this.youtubeService = new YoutubeService(this.env.YOUTUBE_API_KEY);
    this.twitchService = new TwitchService({
      clientId: this.env.TWITCH_CLIENT_ID,
      clientSecret: this.env.TWITCH_CLIENT_SECRET,
    });
    this.twitcastingService = new TwitcastingService(
      this.env.TWITCASTING_ACCESS_TOKEN,
    );
    this.txManager = new TxManager({
      connectionString:
        this.env.ENVIRONMENT === "local"
          ? this.env.DEV_DB_CONNECTION_STRING
          : this.env.DB.connectionString,
      isQueryLoggingEnabled: this.env.ENVIRONMENT === "local",
    });
    this.aiService = new AIService({
      apiKey: this.env.OPENAI_API_KEY,
      organization: this.env.OPENAI_ORGANIZATION,
      project: this.env.OPENAI_PROJECT,
      baseURL: this.env.OPENAI_BASE_URL,
    });
    const context = new AppContext(
      this.txManager,
      this.youtubeService,
      this.twitchService,
      this.twitcastingService,
      this.aiService,
    );
    this.creatorInteractor = new CreatorInteractor(context);
    this.videoInteractor = new VideoInteractor(context);
  }
}
