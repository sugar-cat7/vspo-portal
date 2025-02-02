import { asc, count, eq, inArray } from "drizzle-orm";
import { type DiscordServers, createDiscordServers } from "../../domain";
import {
  convertToUTC,
  convertToUTCDate,
  getCurrentUTCDate,
} from "../../pkg/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "../../pkg/errors";
import { createUUID } from "../../pkg/uuid";
import {
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
}

export class DiscordServerRepository implements IDiscordServerRepository {
  constructor(private readonly db: DB) {}

  async list(query: ListQuery): Promise<Result<DiscordServers, AppError>> {
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

    const discordServersHasChannelIdsMap = new Map<string, string[]>();
    for (const row of discordServerResult.val) {
      const serverId = row.discord_server.serverId;
      const channelId = row.discord_channel.channelId;
      const channelIds = discordServersHasChannelIdsMap.get(serverId) ?? [];
      channelIds.push(channelId);
      discordServersHasChannelIdsMap.set(serverId, channelIds);
    }

    return Ok(
      createDiscordServers(
        discordServerResult.val.map((row) => ({
          id: row.discord_server.id,
          rawId: row.discord_server.serverId,
          botMessageChannelIds:
            discordServersHasChannelIdsMap.get(row.discord_server.serverId) ??
            [],
          name: row.discord_server.name,
          createdAt: convertToUTC(row.discord_server.createdAt),
          updatedAt: convertToUTC(row.discord_server.updatedAt),
        })),
      ),
    );
  }

  async count(query: ListQuery): Promise<Result<number, AppError>> {
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
  }

  async batchUpsert(
    discordServers: DiscordServers,
  ): Promise<Result<DiscordServers, AppError>> {
    const dbDiscordServers = discordServers.map((server) =>
      createInsertDiscordServer({
        id: server.id,
        serverId: server.rawId,
        name: server.name,
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
          set: {
            name: discordServerTable.name,
            updatedAt: getCurrentUTCDate(),
          },
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
      server.botMessageChannelIds.map((channelId) => ({
        id: server.id || createUUID(),
        channelId: channelId,
        serverId: server.rawId,
        name: `Channel for ${server.name}`,
        createdAt: convertToUTCDate(server.createdAt),
        updatedAt: convertToUTCDate(server.updatedAt),
      })),
    );

    const discordChannelResult = await wrap(
      this.db
        .insert(discordChannelTable)
        .values(dbDiscordChannels)
        .onConflictDoUpdate({
          target: [discordChannelTable.channelId, discordChannelTable.serverId],
          set: {
            name: discordChannelTable.name,
            updatedAt: getCurrentUTCDate(),
          },
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
          botMessageChannelIds: [],
          name: r.name,
          createdAt: convertToUTC(r.createdAt),
          updatedAt: convertToUTC(r.updatedAt),
        })),
      ),
    );
  }

  async batchDeleteChannelsByRowChannelIds(
    discordChannelIds: string[],
  ): Promise<Result<void, AppError>> {
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
  }
}
