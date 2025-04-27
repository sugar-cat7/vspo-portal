import { count, desc, eq, inArray } from "drizzle-orm";
import {
  type DiscordMessage,
  type DiscordMessages,
  createDiscordMessage,
  createDiscordMessages,
} from "../../domain";
import {
  convertToUTC,
  convertToUTCDate,
  getCurrentUTCDate,
} from "../../pkg/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "../../pkg/errors";
import { createUUID } from "../../pkg/uuid";
import { withTracerResult } from "../http/trace/cloudflare";
import {
  createInsertDiscordAdminMessage,
  createInsertDiscordMessage,
  discordAdminMessageTable,
  discordMessageTable,
} from "./schema";
import type { DB } from "./transaction";

type ListQuery = {
  limit: number;
  page: number;
  channelId: string;
};

export interface IDiscordMessageRepository {
  create(message: DiscordMessage): Promise<Result<DiscordMessage, AppError>>;
  getById(id: string): Promise<Result<DiscordMessage, AppError>>;
  list(query: ListQuery): Promise<Result<DiscordMessages, AppError>>;
  count(query: ListQuery): Promise<Result<number, AppError>>;
}

export class DiscordMessageRepository implements IDiscordMessageRepository {
  constructor(private readonly db: DB) {}

  async create(
    message: DiscordMessage,
  ): Promise<Result<DiscordMessage, AppError>> {
    return withTracerResult(
      "DiscordMessageRepository",
      "create",
      async (span) => {
        const id = message.id || createUUID();
        const now = getCurrentUTCDate();

        // Insert or update the message content
        const messageResult = await wrap(
          this.db
            .insert(discordMessageTable)
            .values(
              createInsertDiscordMessage({
                id,
                message: message.content,
                createdAt: convertToUTCDate(message.createdAt) || now,
                updatedAt: now,
              }),
            )
            .onConflictDoUpdate({
              target: discordMessageTable.id,
              set: {
                message: message.content,
                updatedAt: now,
              },
            })
            .returning()
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during discord message save: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
              cause: err,
            }),
        );

        if (messageResult.err) {
          return Err(messageResult.err);
        }

        if (message.type === "admin") {
          const adminMessageResult = await wrap(
            this.db
              .insert(discordAdminMessageTable)
              .values(
                createInsertDiscordAdminMessage({
                  id: createUUID(),
                  messageId: id,
                  adminMessageId: message.rawId,
                  channelId: message.channelId,
                }),
              )
              .execute(),
            (err) =>
              new AppError({
                message: `Database error during discord admin message save: ${err.message}`,
                code: "INTERNAL_SERVER_ERROR",
                cause: err,
              }),
          );

          if (adminMessageResult.err) {
            return Err(adminMessageResult.err);
          }
        }

        const savedMessage = messageResult.val[0];
        return Ok(
          createDiscordMessage({
            id: savedMessage.id,
            type: message.type,
            rawId: message.rawId,
            channelId: message.channelId,
            content: savedMessage.message,
            embedVideos: message.embedVideos || [],
            createdAt: convertToUTC(savedMessage.createdAt),
            updatedAt: convertToUTC(savedMessage.updatedAt),
          }),
        );
      },
    );
  }

  async getById(id: string): Promise<Result<DiscordMessage, AppError>> {
    return withTracerResult(
      "DiscordMessageRepository",
      "getById",
      async (span) => {
        const messageResult = await wrap(
          this.db
            .select({
              message: discordMessageTable,
              adminMessage: discordAdminMessageTable,
            })
            .from(discordMessageTable)
            .leftJoin(
              discordAdminMessageTable,
              eq(discordMessageTable.id, discordAdminMessageTable.messageId),
            )
            .where(eq(discordMessageTable.id, id))
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during discord message retrieval: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
              cause: err,
            }),
        );

        if (messageResult.err) {
          return Err(messageResult.err);
        }

        const result = messageResult.val[0];
        if (!result) {
          return Err(
            new AppError({
              message: `Discord message not found: ${id}`,
              code: "NOT_FOUND",
            }),
          );
        }

        const { message, adminMessage } = result;

        return Ok(
          createDiscordMessage({
            id: message.id,
            type: adminMessage ? "admin" : "bot",
            rawId: adminMessage ? adminMessage.adminMessageId : "",
            channelId: adminMessage ? adminMessage.channelId : "",
            content: message.message,
            embedVideos: [], // Embed videos would need to be parsed from the message or stored separately
            createdAt: convertToUTC(message.createdAt),
            updatedAt: convertToUTC(message.updatedAt),
          }),
        );
      },
    );
  }

  async list(query: ListQuery): Promise<Result<DiscordMessages, AppError>> {
    return withTracerResult(
      "DiscordMessageRepository",
      "list",
      async (span) => {
        const messagesResult = await wrap(
          this.db
            .select({
              message: discordMessageTable,
              adminMessage: discordAdminMessageTable,
            })
            .from(discordMessageTable)
            .leftJoin(
              discordAdminMessageTable,
              eq(discordMessageTable.id, discordAdminMessageTable.messageId),
            )
            .where(eq(discordAdminMessageTable.channelId, query.channelId))
            .limit(query.limit)
            .offset(query.page * query.limit)
            .orderBy(desc(discordMessageTable.createdAt))
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during discord messages list query: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
              cause: err,
            }),
        );

        if (messagesResult.err) {
          return Err(messagesResult.err);
        }

        return Ok(
          createDiscordMessages(
            messagesResult.val.map((result) => {
              const { message, adminMessage } = result;
              return {
                id: message.id,
                type: adminMessage ? "admin" : "bot",
                rawId: adminMessage ? adminMessage.adminMessageId : "",
                channelId: adminMessage ? adminMessage.channelId : "",
                content: message.message,
                embedVideos: [],
                createdAt: convertToUTC(message.createdAt),
                updatedAt: convertToUTC(message.updatedAt),
              };
            }),
          ),
        );
      },
    );
  }

  async count(query: ListQuery): Promise<Result<number, AppError>> {
    return withTracerResult(
      "DiscordMessageRepository",
      "count",
      async (span) => {
        const countResult = await wrap(
          this.db
            .select({ count: count() })
            .from(discordMessageTable)
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during discord messages count query: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
              cause: err,
            }),
        );

        if (countResult.err) {
          return Err(countResult.err);
        }

        return Ok(countResult.val.at(0)?.count ?? 0);
      },
    );
  }
}
