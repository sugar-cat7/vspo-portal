import { RpcTarget, WorkerEntrypoint } from "cloudflare:workers";
import {
  type AppWorkerEnv,
  zAppWorkerEnv,
} from "../../../../config/env/internal";
import { TargetLangSchema } from "../../../../domain/translate";
import { Container } from "../../../../infra/dependency";
import {
  type MessageParam,
  queueHandler,
} from "../../../../infra/queue/handler";
import type {
  AdjustBotChannelParams,
  BatchDeleteByStreamIdsParam,
  BatchUpsertCreatorsParam,
  BatchUpsertDiscordServersParam,
  BatchUpsertStreamsParam,
  ICreatorInteractor,
  IDiscordInteractor,
  IStreamInteractor,
  ListByMemberTypeParam,
  ListDiscordServerParam,
  ListParam,
  SearchByChannelIdsParam,
  SearchByMemberTypeParam,
  SearchByStreamIdsAndCreateParam,
  SendAdminMessageParams,
  SendMessageParams,
  TranslateCreatorParam,
  TranslateStreamParam,
} from "../../../../usecase";
import type {
  BatchUpsertClipsParam,
  IClipInteractor,
  ListClipsQuery,
} from "../../../../usecase/clip";

async function batchEnqueueWithChunks<T, U>(
  items: T[],
  chunkSize: number,
  transform: (item: T) => { body: U },
  queue: Queue<U>,
): Promise<void> {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  await Promise.all(
    chunks.map((chunk) => queue.sendBatch(chunk.map(transform))),
  );
}

export class StreamService extends RpcTarget {
  #usecase: IStreamInteractor;
  #queue: Queue<MessageParam>;
  constructor(usecase: IStreamInteractor, queue: Queue<MessageParam>) {
    super();
    this.#usecase = usecase;
    this.#queue = queue;
  }

  async batchUpsertEnqueue(params: BatchUpsertStreamsParam) {
    return batchEnqueueWithChunks(
      params,
      100,
      (stream) => ({ body: { ...stream, kind: "upsert-stream" as const } }),
      this.#queue,
    );
  }

  async batchUpsert(params: BatchUpsertStreamsParam) {
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

  async searchDeletedCheck() {
    return this.#usecase.searchDeletedCheck();
  }

  async batchDeleteByStreamIds(params: BatchDeleteByStreamIdsParam) {
    return this.#usecase.batchDeleteByStreamIds(params);
  }

  async translateStreamEnqueue(params: TranslateStreamParam) {
    return batchEnqueueWithChunks(
      params.streams,
      100,
      (stream) => ({
        body: {
          ...stream,
          languageCode: TargetLangSchema.parse(params.languageCode),
          kind: "translate-stream" as const,
        },
      }),
      this.#queue,
    );
  }

  async getMemberStreams() {
    return this.#usecase.getMemberStreams();
  }

  async deletedListIds() {
    return this.#usecase.deletedListIds();
  }

  async searchByStreamsIdsAndCreate(params: SearchByStreamIdsAndCreateParam) {
    return this.#usecase.searchByStreamsIdsAndCreate(params);
  }
}

export class ClipService extends RpcTarget {
  #usecase: IClipInteractor;
  #queue: Queue<MessageParam>;
  constructor(usecase: IClipInteractor, queue: Queue<MessageParam>) {
    super();
    this.#usecase = usecase;
    this.#queue = queue;
  }

  async batchUpsertEnqueue(params: BatchUpsertClipsParam) {
    return batchEnqueueWithChunks(
      params,
      100,
      (clip) => ({ body: { ...clip, kind: "upsert-clip" as const } }),
      this.#queue,
    );
  }

  async batchUpsert(params: BatchUpsertClipsParam) {
    return this.#usecase.batchUpsert(params);
  }

  async list(params: ListClipsQuery) {
    return this.#usecase.list(params);
  }

  async searchNewVspoClipsAndNewCreators() {
    return this.#usecase.searchNewVspoClipsAndNewCreators();
  }

  async searchExistVspoClips({ clipIds }: { clipIds: string[] }) {
    return this.#usecase.searchExistVspoClips({ clipIds });
  }

  async deleteClips({ clipIds }: { clipIds: string[] }) {
    return this.#usecase.deleteClips({ clipIds });
  }
}

export class CreatorService extends RpcTarget {
  #usecase: ICreatorInteractor;
  #queue: Queue<MessageParam>;
  constructor(usecase: ICreatorInteractor, queue: Queue<MessageParam>) {
    super();
    this.#usecase = usecase;
    this.#queue = queue;
  }

  async batchUpsertEnqueue(params: BatchUpsertCreatorsParam) {
    return batchEnqueueWithChunks(
      params,
      100,
      (creator) => ({ body: { ...creator, kind: "upsert-creator" as const } }),
      this.#queue,
    );
  }

  async translateCreatorEnqueue(params: TranslateCreatorParam) {
    return batchEnqueueWithChunks(
      params.creators,
      100,
      (creator) => ({
        body: {
          ...creator,
          languageCode: params.languageCode,
          kind: "translate-creator" as const,
        },
      }),
      this.#queue,
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
  #queue: Queue<MessageParam>;
  constructor(usecase: IDiscordInteractor, queue: Queue<MessageParam>) {
    super();
    this.#usecase = usecase;
    this.#queue = queue;
  }

  async sendStreamsToMultipleChannels(params: SendMessageParams) {
    return this.#usecase.batchSendMessages(params);
  }

  async adjustBotChannel(params: AdjustBotChannelParams) {
    return this.#usecase.adjustBotChannel(params);
  }

  async get(serverId: string) {
    return this.#usecase.get(serverId);
  }

  async batchUpsertEnqueue(params: BatchUpsertDiscordServersParam) {
    return batchEnqueueWithChunks(
      params,
      100,
      (server) => ({
        body: { ...server, kind: "upsert-discord-server" as const },
      }),
      this.#queue,
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

  async existsChannel(channelId: string) {
    return this.#usecase.existsChannel(channelId);
  }

  async sendAdminMessage(message: SendAdminMessageParams) {
    return this.#usecase.sendAdminMessage(message);
  }

  async deleteMessageInChannelEnqueue(channelId: string) {
    return batchEnqueueWithChunks(
      [channelId],
      100,
      (channelId) => ({
        body: { channelId, kind: "delete-message-in-channel" as const },
      }),
      this.#queue,
    );
  }
}

export class ApplicationService extends WorkerEntrypoint<AppWorkerEnv> {
  newStreamUsecase() {
    const d = this.setup();
    return new StreamService(d.streamInteractor, this.env.WRITE_QUEUE);
  }

  newCreatorUsecase() {
    const d = this.setup();
    return new CreatorService(d.creatorInteractor, this.env.WRITE_QUEUE);
  }

  newDiscordUsecase() {
    const d = this.setup();
    return new DiscordService(d.discordInteractor, this.env.WRITE_QUEUE);
  }

  newClipUsecase() {
    const d = this.setup();
    return new ClipService(d.clipInteractor, this.env.WRITE_QUEUE);
  }

  private setup() {
    const e = zAppWorkerEnv.safeParse(this.env);
    if (!e.success) {
      throw new Error(e.error.message);
    }
    return new Container(e.data);
  }
}

export default queueHandler;
