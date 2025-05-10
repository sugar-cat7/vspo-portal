import type { AppError, Result } from "@vspo-lab/error";
import type { PgTransactionConfig } from "drizzle-orm/pg-core";
import {
  CreatorService,
  type ICreatorService,
  type IStreamService,
  StreamService,
} from "../../domain";
import {
  CreatorRepository,
  type DB,
  DiscordMessageRepository,
  DiscordServerRepository,
  type ICreatorRepository,
  type IDiscordMessageRepository,
  type IDiscordServerRepository,
  type IStreamRepository,
  type ITxManager,
  StreamRepository,
  TxManager,
} from "../repository";
import { type ITwitcastingService, TwitcastingService } from "../twitcasting";
import { type ITwitchService, TwitchService } from "../twitch";
import { type IYoutubeService, YoutubeService } from "../youtube";

import type { AppWorkerEnv } from "../../config/env/internal";
import { ClipService, type IClipService } from "../../domain/service/clip";
import {
  DiscordService,
  type IDiscordService,
} from "../../domain/service/discord";
import {
  CreatorInteractor,
  EventInteractor,
  type ICreatorInteractor,
  type IEventInteractor,
  type IStreamInteractor,
  StreamInteractor,
} from "../../usecase";
import { ClipInteractor, type IClipInteractor } from "../../usecase/clip";
import {
  DiscordInteractor,
  type IDiscordInteractor,
} from "../../usecase/discord";
import { AIService, type IAIService } from "../ai";
import { CloudflareKVCacheClient, type ICacheClient } from "../cache";
import { DiscordClient, type IDiscordClient } from "../discord";
import { ClipRepository, type IClipRepository } from "../repository/clip";
import { EventRepository, type IEventRepository } from "../repository/event";

export interface IRepositories {
  creatorRepository: ICreatorRepository;
  streamRepository: IStreamRepository;
  discordServerRepository: IDiscordServerRepository;
  discordMessageRepository: IDiscordMessageRepository;
  clipRepository: IClipRepository;
  eventRepository: IEventRepository;
}

export function createRepositories(tx: DB): IRepositories {
  return {
    creatorRepository: new CreatorRepository(tx),
    streamRepository: new StreamRepository(tx),
    discordServerRepository: new DiscordServerRepository(tx),
    discordMessageRepository: new DiscordMessageRepository(tx),
    clipRepository: new ClipRepository(tx),
    eventRepository: new EventRepository(tx),
  };
}

export interface IServices {
  creatorService: ICreatorService;
  streamService: IStreamService;
  discordService: IDiscordService;
  clipService: IClipService;
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
    streamService: new StreamService({
      youtubeClient,
      twitchClient,
      twitCastingClient: twitcastingClient,
      creatorRepository: repos.creatorRepository,
      streamRepository: repos.streamRepository,
      aiService,
      cacheClient,
    }),
    discordService: new DiscordService({
      discordServerRepository: repos.discordServerRepository,
      discordClient: discordClient,
      streamRepository: repos.streamRepository,
      discordMessageRepository: repos.discordMessageRepository,
      cacheClient,
    }),
    clipService: new ClipService({
      youtubeClient,
      twitchClient,
      creatorRepository: repos.creatorRepository,
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
  streamInteractor: IStreamInteractor;
  clipInteractor: IClipInteractor;
  discordInteractor: IDiscordInteractor;
  eventInteractor: IEventInteractor;

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
    this.streamInteractor = new StreamInteractor(context);
    this.discordInteractor = new DiscordInteractor(context);
    this.clipInteractor = new ClipInteractor(context);
    this.eventInteractor = new EventInteractor(context);
  }
}
