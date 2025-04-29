import { RpcTarget, WorkerEntrypoint } from "cloudflare:workers";
import { z } from "zod";
import {
  type AppWorkerEnv,
  zAppWorkerEnv,
} from "../../../../config/env/internal";
import { setFeatureFlagProvider } from "../../../../config/featureFlag";
import {
  type Creator,
  CreatorsSchema,
  type DiscordServer,
  type Stream,
  StreamsSchema,
  discordServers,
} from "../../../../domain";
import { t } from "../../../../domain/service/i18n";
import { TargetLangSchema } from "../../../../domain/translate";
import { Container } from "../../../../infra/dependency";
import { createHandler, withTracer } from "../../../../infra/http/trace";
import { AppLogger } from "../../../../pkg/logging";
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
async function batchEnqueueWithChunks<T, U extends MessageParam>(
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
  #queue: Queue<StreamMessage>;
  constructor(usecase: IStreamInteractor, queue: Queue) {
    super();
    this.#usecase = usecase;
    this.#queue = queue;
  }

  async batchUpsertEnqueue(params: BatchUpsertStreamsParam) {
    return batchEnqueueWithChunks(
      params,
      100,
      (stream) => ({ body: { ...stream, kind: "upsert-stream" } }),
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
          kind: "translate-stream",
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

export class CreatorService extends RpcTarget {
  #usecase: ICreatorInteractor;
  #queue: Queue<CreatorMessage>;
  constructor(usecase: ICreatorInteractor, queue: Queue) {
    super();
    this.#usecase = usecase;
    this.#queue = queue;
  }

  async batchUpsertEnqueue(params: BatchUpsertCreatorsParam) {
    return batchEnqueueWithChunks(
      params,
      100,
      (creator) => ({ body: { ...creator, kind: "upsert-creator" } }),
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
          kind: "translate-creator",
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
  #queue: Queue<DiscordMessage>;
  constructor(usecase: IDiscordInteractor, queue: Queue) {
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
      (server) => ({ body: { ...server, kind: "upsert-discord-server" } }),
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
        body: { channelId, kind: "delete-message-in-channel" },
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

  private setup() {
    const e = zAppWorkerEnv.safeParse(this.env);
    if (!e.success) {
      throw new Error(e.error.message);
    }
    return new Container(e.data);
  }
}

type Kind =
  | "translate-stream"
  | "upsert-stream"
  | "upsert-creator"
  | "translate-creator"
  | "discord-send-message"
  | "upsert-discord-server"
  | "delete-message-in-channel";

type BaseMessageParam<T, K extends Kind> = T & { kind: K };

type TranslateStream = BaseMessageParam<Stream, "translate-stream">;
type TranslateCreator = BaseMessageParam<Creator, "translate-creator">;
type UpsertStream = BaseMessageParam<Stream, "upsert-stream">;
type UpsertCreator = BaseMessageParam<Creator, "upsert-creator">;
type DiscordSend = BaseMessageParam<Stream, "discord-send-message">;
type UpsertDiscordServer = BaseMessageParam<
  DiscordServer,
  "upsert-discord-server"
>;
type DeleteMessageInChannel = BaseMessageParam<
  { channelId: string },
  "delete-message-in-channel"
>;

type CreatorMessage = TranslateCreator | UpsertCreator;
type StreamMessage = TranslateStream | UpsertStream;
type DiscordMessage =
  | DiscordSend
  | UpsertDiscordServer
  | DeleteMessageInChannel;

type MessageParam =
  | CreatorMessage
  | StreamMessage
  | DiscordMessage
  | UpsertDiscordServer
  | DeleteMessageInChannel;

// Type guard functions for each message type
function isTranslateStream(message: unknown): message is TranslateStream {
  return (
    typeof message === "object" &&
    message !== null &&
    "kind" in message &&
    message.kind === "translate-stream"
  );
}

function isUpsertStream(message: unknown): message is UpsertStream {
  return (
    typeof message === "object" &&
    message !== null &&
    "kind" in message &&
    message.kind === "upsert-stream"
  );
}

function isUpsertCreator(message: unknown): message is UpsertCreator {
  return (
    typeof message === "object" &&
    message !== null &&
    "kind" in message &&
    message.kind === "upsert-creator"
  );
}

function isTranslateCreator(message: unknown): message is TranslateCreator {
  return (
    typeof message === "object" &&
    message !== null &&
    "kind" in message &&
    message.kind === "translate-creator"
  );
}

function isDiscordSend(message: unknown): message is DiscordSend {
  return (
    typeof message === "object" &&
    message !== null &&
    "kind" in message &&
    message.kind === "discord-send-message"
  );
}

function isUpsertDiscordServer(
  message: unknown,
): message is UpsertDiscordServer {
  return (
    typeof message === "object" &&
    message !== null &&
    "kind" in message &&
    message.kind === "upsert-discord-server"
  );
}

function isDeleteMessageInChannel(
  message: unknown,
): message is DeleteMessageInChannel {
  return (
    typeof message === "object" &&
    message !== null &&
    "kind" in message &&
    message.kind === "delete-message-in-channel"
  );
}

export default createHandler({
  queue: async (
    batch: MessageBatch<MessageParam>,
    env: AppWorkerEnv,
    _executionContext: ExecutionContext,
  ) => {
    setFeatureFlagProvider(env);
    return await withTracer("QueueHandler", "queue.consumer", async (span) => {
      const e = zAppWorkerEnv.safeParse(env);
      if (!e.success) {
        console.log(e.error.message);
        return;
      }
      const c = new Container(e.data);
      const logger = AppLogger.getInstance(e.data);

      // Define type-safe message storage
      const messageGroups = {
        "translate-stream": [] as TranslateStream[],
        "upsert-stream": [] as UpsertStream[],
        "upsert-creator": [] as UpsertCreator[],
        "translate-creator": [] as TranslateCreator[],
        "discord-send-message": [] as DiscordSend[],
        "upsert-discord-server": [] as UpsertDiscordServer[],
        "delete-message-in-channel": [] as DeleteMessageInChannel[],
      };

      // Group messages by kind without type assertions
      for (const message of batch.messages) {
        const body = message.body;
        if (!body) continue;

        if (isTranslateStream(body)) {
          messageGroups["translate-stream"].push(body);
        } else if (isUpsertStream(body)) {
          messageGroups["upsert-stream"].push(body);
        } else if (isUpsertCreator(body)) {
          messageGroups["upsert-creator"].push(body);
        } else if (isTranslateCreator(body)) {
          messageGroups["translate-creator"].push(body);
        } else if (isDiscordSend(body)) {
          messageGroups["discord-send-message"].push(body);
        } else if (isUpsertDiscordServer(body)) {
          messageGroups["upsert-discord-server"].push(body);
        } else if (isDeleteMessageInChannel(body)) {
          messageGroups["delete-message-in-channel"].push(body);
        }
      }

      // Get non-empty message groups for logging
      const nonEmptyGroupNames = Object.entries(messageGroups)
        .filter(([_, messages]) => messages.length > 0)
        .map(([kind]) => kind);

      logger.info(
        `Processing message groups: ${nonEmptyGroupNames.join(", ")}`,
      );

      // Process each kind of message
      if (messageGroups["upsert-stream"].length > 0) {
        const messages = messageGroups["upsert-stream"];
        logger.info(
          `Processing ${messages.length} messages of kind: upsert-stream`,
        );
        span.setAttributes({
          queue: batch.queue,
          kind: "upsert-stream",
          count: messages.length,
        });

        logger.debug("Upserting Queued streams", {
          streams: messages.map((v) => ({
            rawId: v.rawId,
            title: v.title,
            status: v.status,
            languageCode: v.languageCode,
          })),
        });

        const streams = StreamsSchema.safeParse(messages);
        if (!streams.success) {
          logger.error(`Invalid streams: ${streams.error.message}`);
        } else {
          const v = await c.streamInteractor.batchUpsert(streams.data);
          if (v.err) {
            logger.error(`Failed to upsert streams: ${v.err.message}`);
            throw v.err;
          }
        }
      }

      if (messageGroups["upsert-creator"].length > 0) {
        const messages = messageGroups["upsert-creator"];
        logger.info(
          `Processing ${messages.length} messages of kind: upsert-creator`,
        );
        span.setAttributes({
          queue: batch.queue,
          kind: "upsert-creator",
          count: messages.length,
        });

        const creators = CreatorsSchema.safeParse(messages);
        if (!creators.success) {
          logger.error(`Invalid creators: ${creators.error.message}`);
        } else {
          const r = await c.creatorInteractor.batchUpsert(creators.data);
          if (r.err) {
            logger.error(`Failed to upsert creators: ${r.err.message}`);
            throw r.err;
          }
        }
      }

      if (messageGroups["translate-stream"].length > 0) {
        const messages = messageGroups["translate-stream"];
        logger.info(
          `Processing ${messages.length} messages of kind: translate-stream`,
        );
        span.setAttributes({
          queue: batch.queue,
          kind: "translate-stream",
          count: messages.length,
        });

        const v = StreamsSchema.safeParse(messages);
        if (!v.success) {
          logger.error(`Invalid streams: ${v.error.message}`);
        } else {
          // Group streams by language code
          const streamsByLang = v.data.reduce(
            (acc, stream) => {
              const langCode = stream.languageCode;
              if (!acc[langCode]) {
                acc[langCode] = [];
              }
              acc[langCode].push(stream);
              return acc;
            },
            {} as Record<string, typeof v.data>,
          );

          // Process each language group separately
          for (const [langCode, streams] of Object.entries(streamsByLang)) {
            const tv = await c.streamInteractor.translateStream({
              languageCode: langCode,
              streams: streams,
            });

            if (tv.err) {
              logger.error(
                `Failed to translate streams for ${langCode}: ${tv.err.message}`,
              );
              continue;
            }

            if (!tv.val?.length || tv.val.length === 0) {
              logger.info(`No streams to translate for ${langCode}`);
              continue;
            }

            await env.WRITE_QUEUE.sendBatch(
              tv.val.map((stream) => ({
                body: { ...stream, kind: "upsert-stream" },
              })),
            );
          }
        }
      }

      if (messageGroups["translate-creator"].length > 0) {
        const messages = messageGroups["translate-creator"];
        logger.info(
          `Processing ${messages.length} messages of kind: translate-creator`,
        );
        span.setAttributes({
          queue: batch.queue,
          kind: "translate-creator",
          count: messages.length,
        });

        const cr = CreatorsSchema.safeParse(messages);
        if (!cr.success) {
          logger.error(`Invalid creators: ${cr.error.message}`);
        } else {
          // Group creators by language code more efficiently
          const creatorsByLang = new Map<string, typeof cr.data>();

          for (const creator of cr.data) {
            const langCode = creator.languageCode;
            if (!langCode) {
              logger.warn(
                `Creator missing language code, skipping: ${creator.id || "unknown"}`,
              );
              continue;
            }

            if (!creatorsByLang.has(langCode)) {
              creatorsByLang.set(langCode, []);
            }
            creatorsByLang.get(langCode)?.push(creator);
          }

          logger.info(`Grouped creators by ${creatorsByLang.size} languages`);

          // Process each language group separately
          for (const [langCode, creators] of creatorsByLang.entries()) {
            logger.info(
              `Processing ${creators.length} creators for language: ${langCode}`,
            );

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
        }
      }

      if (messageGroups["upsert-discord-server"].length > 0) {
        const messages = messageGroups["upsert-discord-server"];
        logger.info(
          `Processing ${messages.length} messages of kind: upsert-discord-server`,
        );
        span.setAttributes({
          queue: batch.queue,
          kind: "upsert-discord-server",
          count: messages.length,
        });

        logger.info(`Upserting Discord servers: ${messages.length}`);
        logger.debug("Discord servers", {
          servers: messages,
        });
        const sv = await c.discordInteractor.batchUpsert(messages);
        if (sv.err) {
          logger.error(`Failed to upsert discord servers: ${sv.err.message}`);
          throw sv.err;
        }

        // inital add channel
        const initialAddChannel = messages.flatMap((server) =>
          server.discordChannels.filter((ch) => ch.isInitialAdd),
        );

        if (initialAddChannel.length > 0) {
          logger.info("Initial add channel", {
            channels: initialAddChannel,
          });

          await Promise.allSettled(
            initialAddChannel.map((ch) =>
              c.discordInteractor.sendAdminMessage({
                channelId: ch.rawId,
                content: t("initialAddChannel.success"),
              }),
            ),
          );
        }
      }

      if (messageGroups["delete-message-in-channel"].length > 0) {
        const messages = messageGroups["delete-message-in-channel"];
        logger.info(
          `Processing ${messages.length} messages of kind: delete-message-in-channel`,
        );
        span.setAttributes({
          queue: batch.queue,
          kind: "delete-message-in-channel",
          count: messages.length,
        });

        if (!messages.length) {
          logger.error("Invalid delete message in channel");
        } else {
          logger.info("Deleting messages in channels", {
            channelIds: messages,
          });
          await Promise.allSettled(
            messages.map((msg) =>
              c.discordInteractor.deleteAllMessagesInChannel(msg.channelId),
            ),
          );
        }
      }
    });
  },
});
