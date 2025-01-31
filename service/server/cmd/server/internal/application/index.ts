import { RpcTarget, WorkerEntrypoint } from "cloudflare:workers";
import {
  type AppWorkerEnv,
  zAppWorkerEnv,
} from "../../../../config/env/internal";
import {
  type Creator,
  CreatorsSchema,
  type Video,
  VideosSchema,
} from "../../../../domain";
import { Container } from "../../../../infra/dependency";
import { createHandler, withTracer } from "../../../../infra/http/otel";
import { AppLogger } from "../../../../pkg/logging";
import type {
  BatchDeleteByVideoIdsParam,
  BatchUpsertCreatorsParam,
  BatchUpsertVideosParam,
  ICreatorInteractor,
  IVideoInteractor,
  ListByMemberTypeParam,
  ListParam,
  SearchByChannelIdsParam,
  SearchByMemberTypeParam,
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
          languageCode: params.languageCode,
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

export class ApplicationService extends WorkerEntrypoint<AppWorkerEnv> {
  newVideoUsecase() {
    const d = this.setup();
    return new VideoService(d.videoInteractor, this.env.WRITE_QUEUE);
  }

  newCreatorUsecase() {
    const d = this.setup();
    return new CreatorService(d.creatorInteractor, this.env.WRITE_QUEUE);
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
  | "translate-creator";

type BaseMessageParam<T, K extends Kind> = T & { kind: K };

type TranslateVideo = BaseMessageParam<Video, "translate-video">;
type TranslateCreator = BaseMessageParam<Creator, "translate-creator">;
type UpsertVideo = BaseMessageParam<Video, "upsert-video">;
type UpsertCreator = BaseMessageParam<Creator, "upsert-creator">;

type CreatorMessage = TranslateCreator | UpsertCreator;
type VideoMessage = TranslateVideo | UpsertVideo;

type MessageParam = CreatorMessage | VideoMessage;

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
      const logger = new AppLogger({
        env: e.data,
      });
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

          const tv = await c.videoInteractor.translateVideo({
            languageCode: v.data[0].languageCode,
            videos: v.data,
          });

          if (tv.err) {
            logger.error(`Failed to translate videos: ${tv.err.message}`);
            return;
          }

          if (!tv.val?.length || tv.val.length === 0) {
            logger.info("No videos to translate");
            return;
          }

          await env.WRITE_QUEUE.sendBatch(
            tv.val.map((video) => ({
              body: { ...video, kind: "upsert-video" },
            })),
          );
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
          const tc = await c.creatorInteractor.translateCreator({
            languageCode: cr.data[0].languageCode,
            creators: cr.data,
          });

          if (tc.err) {
            logger.error(`Failed to translate creators: ${tc.err.message}`);
            return;
          }

          if (!tc.val?.length || tc.val.length === 0) {
            logger.info("No creators to translate");
            return;
          }

          await env.WRITE_QUEUE.sendBatch(
            tc.val.map((creator) => ({
              body: { ...creator, kind: "upsert-creator" },
            })),
          );
          break;
        }
        default:
          logger.error(`Invalid kind: ${kind}`);
          return;
      }
    });
  },
});
