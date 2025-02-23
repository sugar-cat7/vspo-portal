import { RpcTarget, WorkerEntrypoint } from "cloudflare:workers";
import {
  type AppWorkerEnv,
  zAppWorkerEnv,
} from "../../../../config/env/internal";
import {
  type Creator,
  CreatorsSchema,
  type DiscordServer,
  type Video,
  VideosSchema,
  discordServers,
} from "../../../../domain";
import { TargetLangSchema } from "../../../../domain/translate";
import { Container } from "../../../../infra/dependency";
import {
  createHandler,
  withTracer,
  withTracerResult,
} from "../../../../infra/http/trace";
import { AppLogger } from "../../../../pkg/logging";
import type {
  AdjustBotChannelParams,
  BatchDeleteByVideoIdsParam,
  BatchUpsertCreatorsParam,
  BatchUpsertDiscordServersParam,
  BatchUpsertVideosParam,
  ICreatorInteractor,
  IDiscordInteractor,
  IVideoInteractor,
  ListByMemberTypeParam,
  ListDiscordServerParam,
  ListParam,
  SearchByChannelIdsParam,
  SearchByMemberTypeParam,
  SendMessageParams,
  TranslateCreatorParam,
  TranslateVideoParam,
} from "../../../../usecase";

export class VideoService extends RpcTarget {
  #usecase: IVideoInteractor;
  #queue: Queue<VideoMessage>;
  constructor(usecase: IVideoInteractor, queue: Queue) {
    super();
    this.#usecase = usecase;
    this.#queue = queue;
  }

  async batchUpsertEnqueue(params: BatchUpsertVideosParam) {
    return this.#queue.sendBatch(
      params.map((video) => ({ body: { ...video, kind: "upsert-video" } })),
    );
  }

  async batchUpsert(params: BatchUpsertVideosParam) {
    return this.#usecase.batchUpsert(params);
  }

  async searchLive() {
    return this.#usecase.searchLive();
  }

  async searchExist() {
    return this.#usecase.searchExist();
  }

  async list(params: ListParam) {
    return this.#usecase.list(params);
  }

  async searchDeleted() {
    return this.#usecase.searchDeleted();
  }

  async batchDeleteByVideoIds(params: BatchDeleteByVideoIdsParam) {
    return this.#usecase.batchDeleteByVideoIds(params);
  }

  async translateVideoEnqueue(params: TranslateVideoParam) {
    return this.#queue.sendBatch(
      params.videos.map((video) => ({
        body: {
          ...video,
          languageCode: TargetLangSchema.parse(params.languageCode),
          kind: "translate-video",
        },
      })),
    );
  }
}

export class CreatorService extends RpcTarget {
  #usecase: ICreatorInteractor;
  #queue: Queue<CreatorMessage>;
  constructor(usecase: ICreatorInteractor, queue: Queue) {
    super();
    this.#usecase = usecase;
    this.#queue = queue;
  }

  async batchUpsertEnqueue(params: BatchUpsertCreatorsParam) {
    return this.#queue.sendBatch(
      params.map((creator) => ({
        body: { ...creator, kind: "upsert-creator" },
      })),
    );
  }

  async translateCreatorEnqueue(params: TranslateCreatorParam) {
    return this.#queue.sendBatch(
      params.creators.map((creator) => ({
        body: {
          ...creator,
          languageCode: params.languageCode,
          kind: "translate-creator",
        },
      })),
    );
  }

  async searchByChannelIds(params: SearchByChannelIdsParam) {
    return this.#usecase.searchByChannelIds(params);
  }

  async searchByMemberType(params: SearchByMemberTypeParam) {
    return this.#usecase.searchByMemberType(params);
  }

  async list(params: ListByMemberTypeParam) {
    return this.#usecase.list(params);
  }
}

export class DiscordService extends RpcTarget {
  #usecase: IDiscordInteractor;
  #queue: Queue<DiscordMessage>;
  constructor(usecase: IDiscordInteractor, queue: Queue) {
    super();
    this.#usecase = usecase;
    this.#queue = queue;
  }

  async sendVideosToMultipleChannels(params: SendMessageParams) {
    return this.#usecase.batchSendMessages(params);
  }

  async adjustBotChannel(params: AdjustBotChannelParams) {
    return this.#usecase.adjustBotChannel(params);
  }

  async get(serverId: string) {
    return this.#usecase.get(serverId);
  }

  async batchUpsertEnqueue(params: BatchUpsertDiscordServersParam) {
    return this.#queue.sendBatch(
      params.map((server) => ({
        body: { ...server, kind: "upsert-discord-server" },
      })),
    );
  }

  async batchDeleteChannelsByRowChannelIds(params: string[]) {
    return this.#usecase.batchDeleteChannelsByRowChannelIds(params);
  }

  async list(params: ListDiscordServerParam) {
    return this.#usecase.list(params);
  }

  async deleteAllMessagesInChannel(channelId: string) {
    return this.#usecase.deleteAllMessagesInChannel(channelId);
  }

  async exists(serverId: string) {
    return this.#usecase.exists(serverId);
  }
}

export class ApplicationService extends WorkerEntrypoint<AppWorkerEnv> {
  newVideoUsecase() {
    const d = this.setup();
    return new VideoService(d.videoInteractor, this.env.WRITE_QUEUE);
  }

  newCreatorUsecase() {
    const d = this.setup();
    return new CreatorService(d.creatorInteractor, this.env.WRITE_QUEUE);
  }

  newDiscordUsecase() {
    const d = this.setup();
    return new DiscordService(d.discordInteractor, this.env.WRITE_QUEUE);
  }

  private setup() {
    const e = zAppWorkerEnv.safeParse(this.env);
    if (!e.success) {
      throw new Error(e.error.message);
    }
    return new Container(e.data);
  }
}

type Kind =
  | "translate-video"
  | "upsert-video"
  | "upsert-creator"
  | "translate-creator"
  | "discord-send-message"
  | "upsert-discord-server";

type BaseMessageParam<T, K extends Kind> = T & { kind: K };

type TranslateVideo = BaseMessageParam<Video, "translate-video">;
type TranslateCreator = BaseMessageParam<Creator, "translate-creator">;
type UpsertVideo = BaseMessageParam<Video, "upsert-video">;
type UpsertCreator = BaseMessageParam<Creator, "upsert-creator">;
type DiscordSend = BaseMessageParam<Video, "discord-send-message">;
type UpsertDiscordServer = BaseMessageParam<
  DiscordServer,
  "upsert-discord-server"
>;

type CreatorMessage = TranslateCreator | UpsertCreator;
type VideoMessage = TranslateVideo | UpsertVideo;
type DiscordMessage = DiscordSend | UpsertDiscordServer;

type MessageParam =
  | CreatorMessage
  | VideoMessage
  | DiscordMessage
  | UpsertDiscordServer;

export default createHandler({
  queue: async (
    batch: MessageBatch<MessageParam>,
    env: AppWorkerEnv,
    _executionContext: ExecutionContext,
  ) => {
    return await withTracer("QueueHandler", "queue.consumer", async (span) => {
      const e = zAppWorkerEnv.safeParse(env);
      if (!e.success) {
        console.log(e.error.message);
        return;
      }
      const c = new Container(e.data);
      const logger = AppLogger.getInstance(e.data);
      const kind = batch.messages.at(0)?.body?.kind;
      if (!kind) {
        logger.error("Invalid kind");
        return;
      }

      logger.info(`Consume: ${kind}`);
      span.setAttributes({
        queue: batch.queue,
        kind: kind,
      });
      switch (kind) {
        case "upsert-video": {
          const videos = VideosSchema.safeParse(
            batch.messages.map((m) => m.body),
          );
          if (!videos.success) {
            logger.error(`Invalid videos: ${videos.error.message}`);
            return;
          }
          await c.videoInteractor.batchUpsert(videos.data);
          break;
        }
        case "upsert-creator": {
          const creators = CreatorsSchema.safeParse(
            batch.messages.map((m) => m.body),
          );
          if (!creators.success) {
            logger.error(`Invalid creators: ${creators.error.message}`);
            return;
          }
          await c.creatorInteractor.batchUpsert(creators.data);
          break;
        }
        case "translate-video": {
          const v = VideosSchema.safeParse(batch.messages.map((m) => m.body));
          if (!v.success) {
            logger.error(`Invalid videos: ${v.error.message}`);
            return;
          }

          // Group videos by language code
          const videosByLang = v.data.reduce(
            (acc, video) => {
              const langCode = video.languageCode;
              if (!acc[langCode]) {
                acc[langCode] = [];
              }
              acc[langCode].push(video);
              return acc;
            },
            {} as Record<string, typeof v.data>,
          );

          // Process each language group separately
          for (const [langCode, videos] of Object.entries(videosByLang)) {
            const tv = await c.videoInteractor.translateVideo({
              languageCode: langCode,
              videos: videos,
            });

            if (tv.err) {
              logger.error(
                `Failed to translate videos for ${langCode}: ${tv.err.message}`,
              );
              continue;
            }

            if (!tv.val?.length || tv.val.length === 0) {
              logger.info(`No videos to translate for ${langCode}`);
              continue;
            }

            await env.WRITE_QUEUE.sendBatch(
              tv.val.map((video) => ({
                body: { ...video, kind: "upsert-video" },
              })),
            );
          }
          break;
        }
        case "translate-creator": {
          const cr = CreatorsSchema.safeParse(
            batch.messages.map((m) => m.body),
          );
          if (!cr.success) {
            logger.error(`Invalid creators: ${cr.error.message}`);
            return;
          }

          // Group creators by language code
          const creatorsByLang = cr.data.reduce(
            (acc, creator) => {
              const langCode = creator.languageCode;
              if (!acc[langCode]) {
                acc[langCode] = [];
              }
              acc[langCode].push(creator);
              return acc;
            },
            {} as Record<string, typeof cr.data>,
          );

          // Process each language group separately
          for (const [langCode, creators] of Object.entries(creatorsByLang)) {
            const tc = await c.creatorInteractor.translateCreator({
              languageCode: langCode,
              creators: creators,
            });

            if (tc.err) {
              logger.error(
                `Failed to translate creators for ${langCode}: ${tc.err.message}`,
              );
              continue;
            }

            if (!tc.val?.length || tc.val.length === 0) {
              logger.info(`No creators to translate for ${langCode}`);
              continue;
            }

            await env.WRITE_QUEUE.sendBatch(
              tc.val.map((creator) => ({
                body: { ...creator, kind: "upsert-creator" },
              })),
            );
          }
          break;
        }
        case "discord-send-message": {
          // TODO: Implement
          break;
        }
        case "upsert-discord-server": {
          const ds = discordServers.safeParse(
            batch.messages.map((m) => m.body),
          );
          if (!ds.success) {
            logger.error(`Invalid videos: ${ds.error.message}`);
            return;
          }
          await c.discordInteractor.batchUpsert(ds.data);
          break;
        }
        default:
          logger.error(`Invalid kind: ${kind}`);
          return;
      }
    });
  },
});
