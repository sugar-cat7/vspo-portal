import { asc, count, eq, inArray } from "drizzle-orm";
import {
  DiscordMessage,
  type DiscordServer,
  type DiscordServers,
  createDiscordServers,
  discordChannels,
} from "../../domain";
import {
  convertToUTC,
  convertToUTCDate,
  getCurrentUTCDate,
} from "../../pkg/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "../../pkg/errors";
import { createUUID } from "../../pkg/uuid";
import { withTracerResult } from "../http/trace/cloudflare";
import { buildConflictUpdateColumns } from "./helper";
import {
  type SelectDiscordChannel,
  createInsertDiscordServer,
  discordChannelTable,
  discordServerTable,
} from "./schema";
import type { DB } from "./transaction";

type ListQuery = {
  limit: number;
  page: number;
};

export interface IDiscordServerRepository {
  list(query: ListQuery): Promise<Result<DiscordServers, AppError>>;
  count(query: ListQuery): Promise<Result<number, AppError>>;
  batchUpsert(
    discordServers: DiscordServers,
  ): Promise<Result<DiscordServers, AppError>>;
  batchDeleteChannelsByRowChannelIds(
    discordChannelIds: string[],
  ): Promise<Result<void, AppError>>;
  get(query: { serverId: string }): Promise<Result<DiscordServer, AppError>>;
  exists(query: { serverId: string }): Promise<Result<boolean, AppError>>;
  existsChannel(query: { channelId: string }): Promise<
    Result<boolean, AppError>
  >;
}

export class DiscordServerRepository implements IDiscordServerRepository {
  constructor(private readonly db: DB) {}

  async list(query: ListQuery): Promise<Result<DiscordServers, AppError>> {
    return withTracerResult("DiscordServerRepository", "list", async (span) => {
      const discordServerResult = await wrap(
        this.db
          .select()
          .from(discordServerTable)
          .innerJoin(
            discordChannelTable,
            eq(discordServerTable.serverId, discordChannelTable.serverId),
          )
          // .where(and(...filters))
          .limit(query.limit)
          .offset(query.page * query.limit)
          .orderBy(asc(discordServerTable.createdAt))
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during discordServer list query: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );

      if (discordServerResult.err) {
        return Err(discordServerResult.err);
      }

      const discordServersHasChannelIdsMap = new Map<
        string,
        SelectDiscordChannel[]
      >();
      for (const row of discordServerResult.val) {
        const serverId = row.discord_server.serverId;
        const channels = discordServersHasChannelIdsMap.get(serverId) ?? [];
        channels.push(row.discord_channel);
        discordServersHasChannelIdsMap.set(serverId, channels);
      }

      return Ok(
        createDiscordServers(
          discordServerResult.val.map((row) => ({
            id: row.discord_server.id,
            rawId: row.discord_server.serverId,
            discordChannels: discordChannels.parse(
              discordServersHasChannelIdsMap
                .get(row.discord_server.serverId)
                ?.map((s) => {
                  return {
                    id: s.id,
                    rawId: s.channelId,
                    serverId: s.serverId,
                    name: s.name,
                    languageCode: s.languageCode,
                    createdAt: convertToUTC(s.createdAt),
                    updatedAt: convertToUTC(s.updatedAt),
                  };
                }) ?? [],
            ),
            name: row.discord_server.name,
            languageCode: row.discord_server.languageCode,
            createdAt: convertToUTC(row.discord_server.createdAt),
            updatedAt: convertToUTC(row.discord_server.updatedAt),
          })),
        ),
      );
    });
  }

  async count(query: ListQuery): Promise<Result<number, AppError>> {
    return withTracerResult(
      "DiscordServerRepository",
      "count",
      async (span) => {
        const discordServerResult = await wrap(
          this.db
            .select({ count: count() })
            .from(discordServerTable)
            // .where(and(...filters))
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during discordServer count query: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (discordServerResult.err) {
          return Err(discordServerResult.err);
        }

        return Ok(discordServerResult.val.at(0)?.count ?? 0);
      },
    );
  }

  async batchUpsert(
    discordServers: DiscordServers,
  ): Promise<Result<DiscordServers, AppError>> {
    return withTracerResult(
      "DiscordServerRepository",
      "batchUpsert",
      async (span) => {
        const dbDiscordServers = discordServers.map((server) =>
          createInsertDiscordServer({
            id: server.id,
            serverId: server.rawId,
            name: server.name,
            languageCode: server.languageCode,
            createdAt: convertToUTCDate(server.createdAt),
            updatedAt: convertToUTCDate(server.updatedAt),
          }),
        );

        const discordServerResult = await wrap(
          this.db
            .insert(discordServerTable)
            .values(dbDiscordServers)
            .onConflictDoUpdate({
              target: discordServerTable.serverId,
              set: buildConflictUpdateColumns(discordServerTable, [
                "name",
                "languageCode",
                "updatedAt",
              ]),
            })
            .returning()
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during discord server batch upsert: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (discordServerResult.err) {
          return Err(discordServerResult.err);
        }
        const dbDiscordChannels = discordServers.flatMap((server) =>
          server.discordChannels.map((c) => ({
            id: c.id || createUUID(),
            channelId: c.rawId,
            serverId: server.rawId,
            name: c.name,
            languageCode: c.languageCode,
            createdAt: convertToUTCDate(c.createdAt ?? getCurrentUTCDate()),
            updatedAt: convertToUTCDate(c.updatedAt ?? getCurrentUTCDate()),
          })),
        );
        const discordChannelResult = await wrap(
          this.db
            .insert(discordChannelTable)
            .values(dbDiscordChannels)
            .onConflictDoUpdate({
              target: [
                discordChannelTable.channelId,
                discordChannelTable.serverId,
              ],
              set: buildConflictUpdateColumns(discordChannelTable, [
                "name",
                "languageCode",
                "updatedAt",
              ]),
            })
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during discord channel batch upsert: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (discordChannelResult.err) {
          return Err(discordChannelResult.err);
        }

        return Ok(
          createDiscordServers(
            discordServerResult.val.map((r) => ({
              id: r.id,
              rawId: r.serverId,
              discordChannels: [],
              name: r.name,
              languageCode: r.languageCode,
              createdAt: convertToUTC(r.createdAt),
              updatedAt: convertToUTC(r.updatedAt),
            })),
          ),
        );
      },
    );
  }

  async batchDeleteChannelsByRowChannelIds(
    discordChannelIds: string[],
  ): Promise<Result<void, AppError>> {
    return withTracerResult(
      "DiscordServerRepository",
      "batchDeleteChannelsByRowChannelIds",
      async (span) => {
        const discordChannelResult = await wrap(
          this.db
            .delete(discordChannelTable)
            .where(inArray(discordChannelTable.channelId, discordChannelIds))
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during discord channel batch delete: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );
        if (discordChannelResult.err) {
          return Err(discordChannelResult.err);
        }
        return Ok();
      },
    );
  }

  async get(query: { serverId: string }): Promise<
    Result<DiscordServer, AppError>
  > {
    return withTracerResult("DiscordServerRepository", "get", async (span) => {
      const discordServerResult = await wrap(
        this.db
          .select()
          .from(discordServerTable)
          .innerJoin(
            discordChannelTable,
            eq(discordServerTable.serverId, discordChannelTable.serverId),
          )
          .where(eq(discordServerTable.serverId, query.serverId))
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during discordServer get query: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );

      if (discordServerResult.err) {
        return Err(discordServerResult.err);
      }

      const discordServer = discordServerResult.val[0];
      if (!discordServer) {
        return Err(
          new AppError({
            message: `Discord server not found: ${query.serverId}`,
            code: "NOT_FOUND",
          }),
        );
      }
      const dc = discordServerResult.val?.map((c) => ({
        id: c.discord_channel.id,
        rawId: c.discord_channel.channelId,
        serverId: c.discord_channel.serverId,
        name: c.discord_channel.name,
        languageCode: c.discord_channel.languageCode,
        createdAt: convertToUTC(c.discord_channel.createdAt),
        updatedAt: convertToUTC(c.discord_channel.updatedAt),
      }));
      return Ok({
        id: discordServer.discord_server.id,
        rawId: discordServer.discord_server.serverId,
        discordChannels: discordChannels.parse(dc),
        name: discordServer.discord_server.name,
        languageCode: discordServer.discord_server.languageCode,
        createdAt: convertToUTC(discordServer.discord_server.createdAt),
        updatedAt: convertToUTC(discordServer.discord_server.updatedAt),
      });
    });
  }

  async exists(query: { serverId: string }): Promise<
    Result<boolean, AppError>
  > {
    return withTracerResult(
      "DiscordServerRepository",
      "exists",
      async (span) => {
        const discordServerResult = await wrap(
          this.db
            .select()
            .from(discordServerTable)
            .where(eq(discordServerTable.serverId, query.serverId))
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during discordServer exists query: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (discordServerResult.err) {
          return Err(discordServerResult.err);
        }

        return Ok(discordServerResult.val.length > 0);
      },
    );
  }

  async existsChannel(query: { channelId: string }): Promise<
    Result<boolean, AppError>
  > {
    return withTracerResult(
      "DiscordServerRepository",
      "existsChannel",
      async (span) => {
        const discordChannelResult = await wrap(
          this.db
            .select()
            .from(discordChannelTable)
            .where(eq(discordChannelTable.channelId, query.channelId))
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during discord channel exists query: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (discordChannelResult.err) {
          return Err(discordChannelResult.err);
        }

        return Ok(discordChannelResult.val.length > 0);
      },
    );
  }
}
