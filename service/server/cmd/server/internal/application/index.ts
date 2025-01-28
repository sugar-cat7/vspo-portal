import { RpcTarget, WorkerEntrypoint } from "cloudflare:workers";
import type { AppEnv } from "../../../../config/env";
import {
  type Creator,
  CreatorSchema,
  type Video,
  VideoSchema,
} from "../../../../domain";
import { Container } from "../../../../infra/dependency";
import { createHandler, withTracer } from "../../../../infra/http/otel";
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
} from "../../../../usecase";

export class VideoService extends RpcTarget {
  #usecase: IVideoInteractor;
  #queue: Queue<Video>;
  constructor(usecase: IVideoInteractor, queue: Queue) {
    super();
    this.#usecase = usecase;
    this.#queue = queue;
  }

  async batchUpsertEnqueue(params: BatchUpsertVideosParam) {
    return this.#queue.sendBatch(params.map((video) => ({ body: video })));
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
}

export class CreatorService extends RpcTarget {
  #usecase: ICreatorInteractor;
  #queue: Queue<Creator>;
  constructor(usecase: ICreatorInteractor, queue: Queue) {
    super();
    this.#usecase = usecase;
    this.#queue = queue;
  }

  async batchUpsertEnqueue(params: BatchUpsertCreatorsParam) {
    return this.#queue.sendBatch(params.map((creator) => ({ body: creator })));
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

export class ApplicationService extends WorkerEntrypoint<AppEnv> {
  newVideoUsecase() {
    const d = this.setup();
    return new VideoService(d.videoInteractor, this.env.WRITE_QUEUE);
  }

  newCreatorUsecase() {
    const d = this.setup();
    return new CreatorService(d.creatorInteractor, this.env.WRITE_QUEUE);
  }

  private setup() {
    return new Container(this.env);
  }
}

type MessageParam = Video | Creator;

function isVideoBatch(
  batch: MessageBatch<MessageParam>,
): batch is MessageBatch<Video> {
  const first = batch.messages.at(0)?.body;
  return first != null && VideoSchema.safeParse(first).success;
}

function isCreatorBatch(
  batch: MessageBatch<MessageParam>,
): batch is MessageBatch<Creator> {
  const first = batch.messages.at(0)?.body;
  return first != null && CreatorSchema.safeParse(first).success;
}

export default createHandler({
  fetch: async (
    req: Request,
    env: AppEnv,
    _executionContext: ExecutionContext,
  ) => {
    return new Response("OK");
  },
  queue: async (
    batch: MessageBatch<MessageParam>,
    env: AppEnv,
    _executionContext: ExecutionContext,
  ) => {
    return await withTracer(
      "OTelCFWorkers:Consumer",
      "Consume",
      async (span) => {
        span.addEvent("Consume", { queue: batch.queue });
        const c = new Container(env);
        if (isVideoBatch(batch)) {
          await c.videoInteractor.batchUpsert(
            batch.messages.map((m) => m.body),
          );
        }
        if (isCreatorBatch(batch)) {
          await c.creatorInteractor.batchUpsert(
            batch.messages.map((m) => m.body),
          );
        }
      },
    );
  },
});
