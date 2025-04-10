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
  DiscordMessageRepository,
  DiscordServerRepository,
  type ICreatorRepository,
  type IDiscordMessageRepository,
  type IDiscordServerRepository,
  type ITxManager,
  type IVideoRepository,
  TxManager,
  VideoRepository,
} from "../repository";
import { type ITwitcastingService, TwitcastingService } from "../twitcasting";
import { type ITwitchService, TwitchService } from "../twitch";
import { type IYoutubeService, YoutubeService } from "../youtube";

import type { AppWorkerEnv } from "../../config/env/internal";
import {
  DiscordService,
  type IDiscordService,
} from "../../domain/service/discord";
import {
  CreatorInteractor,
  type ICreatorInteractor,
  type IVideoInteractor,
  VideoInteractor,
} from "../../usecase";
import {
  DiscordInteractor,
  type IDiscordInteractor,
} from "../../usecase/discord";
import { AIService, type IAIService } from "../ai";
import { CloudflareKVCacheClient, type ICacheClient } from "../cache";
import { DiscordClient, type IDiscordClient } from "../discord";

export interface IRepositories {
  creatorRepository: ICreatorRepository;
  videoRepository: IVideoRepository;
  discordServerRepository: IDiscordServerRepository;
  discordMessageRepository: IDiscordMessageRepository;
}

export function createRepositories(tx: DB): IRepositories {
  return {
    creatorRepository: new CreatorRepository(tx),
    videoRepository: new VideoRepository(tx),
    discordServerRepository: new DiscordServerRepository(tx),
    discordMessageRepository: new DiscordMessageRepository(tx),
  };
}

export interface IServices {
  creatorService: ICreatorService;
  videoService: IVideoService;
  discordService: IDiscordService;
}

export function createServices(
  repos: IRepositories,
  youtubeClient: IYoutubeService,
  twitchClient: ITwitchService,
  twitcastingClient: ITwitcastingService,
  aiService: IAIService,
  discordClient: IDiscordClient,
  cacheClient: ICacheClient,
): IServices {
  return {
    creatorService: new CreatorService({
      youtubeClient,
      creatorRepository: repos.creatorRepository,
      aiService,
      cacheClient,
    }),
    videoService: new VideoService({
      youtubeClient,
      twitchClient,
      twitCastingClient: twitcastingClient,
      creatorRepository: repos.creatorRepository,
      videoRepository: repos.videoRepository,
      aiService,
      cacheClient,
    }),
    discordService: new DiscordService({
      discordServerRepository: repos.discordServerRepository,
      discordClient: discordClient,
      videoRepository: repos.videoRepository,
      discordMessageRepository: repos.discordMessageRepository,
      cacheClient,
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
    private readonly discordClient: IDiscordClient,
    private readonly cacheClient: ICacheClient,
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
        this.discordClient,
        this.cacheClient,
      );

      return operation(repos, services);
    }, config);
  }
}

export class Container {
  private readonly youtubeService: IYoutubeService;
  private readonly twitchService: ITwitchService;
  private readonly twitcastingService: ITwitcastingService;
  private readonly discordClient: IDiscordClient;
  private readonly aiService: IAIService;
  private readonly txManager: TxManager;
  private readonly cacheClient: ICacheClient;
  creatorInteractor: ICreatorInteractor;
  videoInteractor: IVideoInteractor;
  discordInteractor: IDiscordInteractor;

  constructor(private readonly env: AppWorkerEnv) {
    this.cacheClient = new CloudflareKVCacheClient(this.env.APP_KV);

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

    this.discordClient = new DiscordClient(this.env);
    const context = new AppContext(
      this.txManager,
      this.youtubeService,
      this.twitchService,
      this.twitcastingService,
      this.aiService,
      this.discordClient,
      this.cacheClient,
    );
    this.creatorInteractor = new CreatorInteractor(context);
    this.videoInteractor = new VideoInteractor(context);
    this.discordInteractor = new DiscordInteractor(context);
  }
}
