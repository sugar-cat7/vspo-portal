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
  BatchUpsertEventParam,
  BatchUpsertStreamsParam,
  ICreatorInteractor,
  IDiscordInteractor,
  IEventInteractor,
  IStreamInteractor,
  ListByMemberTypeParam,
  ListDiscordServerParam,
  ListEventsQuery,
  ListParam,
  SearchByChannelIdsParam,
  SearchByMemberTypeParam,
  SearchByStreamIdsAndCreateParam,
  SendAdminMessageParams,
  SendMessageParams,
  TranslateCreatorParam,
  TranslateStreamParam,
  UpsertEventParam,
} from "../../../../usecase";
import type {
  BatchUpsertClipsParam,
  IClipInteractor,
  ListClipsQuery,
} from "../../../../usecase/clip";
import type {
  IFreechatInteractor,
  ListFreechatsQuery,
} from "../../../../usecase/freechat";

// Utility function to safely send batches respecting size limits
export async function safeSendBatch<T, U>(
  items: { body: U }[],
  queue: Queue<T>,
): Promise<void> {
  const MAX_BATCH_SIZE = 250000; // 256KB limit with some buffer

  // Check batch size before sending
  const batchSize = JSON.stringify(items).length;

  if (batchSize <= MAX_BATCH_SIZE) {
    // If batch size is within limit, send it
    return queue.sendBatch(items as unknown as { body: T }[]);
  }

  // Split the batch in half and process each half separately
  const midpoint = Math.ceil(items.length / 2);
  const firstHalf = items.slice(0, midpoint);
  const secondHalf = items.slice(midpoint);

  // Recursively process both halves
  await Promise.all([
    firstHalf.length > 0 ? safeSendBatch(firstHalf, queue) : Promise.resolve(),
    secondHalf.length > 0
      ? safeSendBatch(secondHalf, queue)
      : Promise.resolve(),
  ]);
}

export async function batchEnqueueWithChunks<T, U>(
  items: T[],
  chunkSize: number,
  transform: (item: T) => { body: U },
  queue: Queue<U>,
): Promise<void> {
  const MAX_BATCH_SIZE = 240000; // 256KB limit with more buffer

  // Process an array of items of any size
  const processItems = async (chunk: T[]): Promise<void> => {
    // For very small chunks, just process directly
    if (chunk.length <= 1) {
      await queue.sendBatch(chunk.map(transform));
      return;
    }

    // For larger chunks, check the serialized size first
    const transformedMessages = chunk.map(transform);
    const batchSize = JSON.stringify(transformedMessages).length;

    if (batchSize <= MAX_BATCH_SIZE) {
      // If size is ok, send the batch
      await queue.sendBatch(transformedMessages);
      return;
    }

    // If too large, split the chunk in half and process recursively
    const midpoint = Math.ceil(chunk.length / 2);
    const firstHalf = chunk.slice(0, midpoint);
    const secondHalf = chunk.slice(midpoint);

    await Promise.all([processItems(firstHalf), processItems(secondHalf)]);
  };

  // First split items into initial chunks by count
  const initialChunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    initialChunks.push(items.slice(i, i + chunkSize));
  }

  // Process each initial chunk, which may get further subdivided if needed
  await Promise.all(initialChunks.map(processItems));
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
      50,
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
      50,
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
      50,
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

  async searchNewClipsByVspoMemberName() {
    return this.#usecase.searchNewClipsByVspoMemberName();
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
      50,
      (creator) => ({ body: { ...creator, kind: "upsert-creator" as const } }),
      this.#queue,
    );
  }

  async translateCreatorEnqueue(params: TranslateCreatorParam) {
    return batchEnqueueWithChunks(
      params.creators,
      50,
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
      50,
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
      50,
      (channelId) => ({
        body: { channelId, kind: "delete-message-in-channel" as const },
      }),
      this.#queue,
    );
  }
}

export class EventService extends RpcTarget {
  #usecase: IEventInteractor;
  constructor(usecase: IEventInteractor) {
    super();
    this.#usecase = usecase;
  }

  async list(params: ListEventsQuery) {
    return this.#usecase.list(params);
  }

  async upsert(params: UpsertEventParam) {
    return this.#usecase.upsert(params);
  }

  async get(id: string) {
    return this.#usecase.get(id);
  }

  async delete(id: string) {
    return this.#usecase.delete(id);
  }

  async batchDelete(ids: string[]) {
    return this.#usecase.batchDelete(ids);
  }

  async batchUpsert(params: BatchUpsertEventParam) {
    return this.#usecase.batchUpsert(params);
  }
}

export class FreechatService extends RpcTarget {
  #usecase: IFreechatInteractor;
  constructor(usecase: IFreechatInteractor) {
    super();
    this.#usecase = usecase;
  }

  async list(params: ListFreechatsQuery) {
    return this.#usecase.list(params);
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

  newEventUsecase() {
    const d = this.setup();
    return new EventService(d.eventInteractor);
  }
  newFreechatUsecase() {
    const d = this.setup();
    return new FreechatService(d.freechatInteractor);
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
