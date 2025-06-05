import {
  convertToUTC,
  convertToUTCDate,
  getCurrentUTCDate,
} from "@vspo-lab/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "@vspo-lab/error";
import { AppLogger } from "@vspo-lab/logging";
import {
  type SQL,
  and,
  asc,
  countDistinct,
  count as drizzleCount,
  eq,
  inArray,
} from "drizzle-orm";
import {
  type Channel,
  type Creators,
  MemberTypeSchema,
  createCreators,
  getPlatformDetail,
} from "../../domain";
import { createUUID } from "../../pkg/uuid";
import { withTracerResult } from "../http/trace/cloudflare";
import { buildConflictUpdateColumns } from "./helper";
import {
  type InsertChannel,
  type InsertCreator,
  type InsertCreatorTranslation,
  channelTable,
  creatorTable,
  creatorTranslationTable,
} from "./schema";
import type { DB } from "./transaction";

type ListQuery = {
  limit: number;
  page: number;
  memberType?: string;
  languageCode?: string;
};

export interface ICreatorRepository {
  list(query: ListQuery): Promise<Result<Creators, AppError>>;
  count(query: ListQuery): Promise<Result<number, AppError>>;
  batchUpsert(creators: Creators): Promise<Result<Creators, AppError>>;
  batchDelete(creatorIds: string[]): Promise<Result<void, AppError>>;
  existsByChannelId(channelId: string): Promise<Result<boolean, AppError>>;
}

const buildFilters = (query: ListQuery): SQL[] => {
  const filters: SQL[] = [];
  const languageCode = query.languageCode || "default";
  if (query.memberType) {
    filters.push(eq(creatorTable.memberType, query.memberType));
  }
  filters.push(eq(creatorTranslationTable.languageCode, languageCode));
  return filters;
};

export const createCreatorRepository = (db: DB): ICreatorRepository => {
  const list = async (
    query: ListQuery,
  ): Promise<Result<Creators, AppError>> => {
    return withTracerResult("CreatorRepository", "list", async (span) => {
      AppLogger.info("CreatorRepository list", {
        query,
      });
      const filters = buildFilters(query);

      const creatorResult = await wrap(
        db
          .select()
          .from(creatorTable)
          .innerJoin(channelTable, eq(creatorTable.id, channelTable.creatorId))
          .innerJoin(
            creatorTranslationTable,
            eq(creatorTable.id, creatorTranslationTable.creatorId),
          )
          .where(and(...filters))
          .limit(query.limit)
          .offset(query.page * query.limit)
          .orderBy(asc(creatorTable.updatedAt))
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during creator list query: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );

      if (creatorResult.err) {
        return Err(creatorResult.err);
      }
      type CreatorMapValue = {
        id: string;
        name: string;
        memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "vspo_all" | "general";
        thumbnailURL: string;
        languageCode: string;
        channel: Channel;
      };

      const creatorMap: Map<string, CreatorMapValue> = new Map();

      for (const r of creatorResult.val) {
        if (!creatorMap.has(r.creator.id)) {
          creatorMap.set(r.creator.id, {
            id: r.creator.id,
            name: r.creator_translation.name,
            languageCode: r.creator_translation.languageCode,
            memberType: MemberTypeSchema.parse(r.creator.memberType),
            thumbnailURL: r.creator.representativeThumbnailUrl ?? "",
            channel: {
              id: r.channel.id,
              creatorID: r.creator.id,
              youtube: null,
              twitch: null,
              twitCasting: null,
              niconico: null,
            },
          });
        }

        const creator = creatorMap.get(r.creator.id);
        if (!creator) {
          continue;
        }
        if (r.channel.platformType === "youtube") {
          creator.channel.youtube = {
            rawId: r.channel.platformChannelId,
            name: r.channel.title,
            description: r.channel.description,
            thumbnailURL: r.channel.thumbnailUrl,
            publishedAt: convertToUTC(r.channel.publishedAt),
            subscriberCount: r.channel.subscriberCount,
          };
        }
        if (r.channel.platformType === "twitch") {
          creator.channel.twitch = {
            rawId: r.channel.platformChannelId,
            name: r.channel.title,
            description: r.channel.description,
            thumbnailURL: r.channel.thumbnailUrl,
            publishedAt: convertToUTC(r.channel.publishedAt),
            subscriberCount: r.channel.subscriberCount,
          };
        }
        if (r.channel.platformType === "twitcasting") {
          creator.channel.twitCasting = {
            rawId: r.channel.platformChannelId,
            name: r.channel.title,
            description: r.channel.description,
            thumbnailURL: r.channel.thumbnailUrl,
            publishedAt: convertToUTC(r.channel.publishedAt),
            subscriberCount: r.channel.subscriberCount,
          };
        }
        if (r.channel.platformType === "niconico") {
          creator.channel.niconico = {
            rawId: r.channel.platformChannelId,
            name: r.channel.title,
            description: r.channel.description,
            thumbnailURL: r.channel.thumbnailUrl,
            publishedAt: convertToUTC(r.channel.publishedAt),
            subscriberCount: r.channel.subscriberCount,
          };
        }
      }

      return Ok(createCreators(Array.from(creatorMap.values())));
    });
  };

  const count = async (query: ListQuery): Promise<Result<number, AppError>> => {
    return withTracerResult("CreatorRepository", "count", async (span) => {
      const filters = buildFilters(query);

      const creatorResult = await wrap(
        db
          .select({ value: countDistinct(creatorTable.id) })
          .from(creatorTable)
          .innerJoin(channelTable, eq(creatorTable.id, channelTable.creatorId))
          .innerJoin(
            creatorTranslationTable,
            eq(creatorTable.id, creatorTranslationTable.creatorId),
          )
          .where(and(...filters))
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during creator count query: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );

      if (creatorResult.err) {
        return Err(creatorResult.err);
      }

      return Ok(creatorResult.val.at(0)?.value ?? 0);
    });
  };

  const batchUpsert = async (
    creators: Creators,
  ): Promise<Result<Creators, AppError>> => {
    return withTracerResult(
      "CreatorRepository",
      "batchUpsert",
      async (span) => {
        const dbCreatorss: InsertCreator[] = [];
        const dbCreatorTranslations: InsertCreatorTranslation[] = [];
        const dbChannels: InsertChannel[] = [];

        for (const c of creators) {
          const creator = dbCreatorss.find((creator) => creator.id === c.id);
          if (!creator && c.languageCode === "default" && !c.translated) {
            dbCreatorss.push({
              id: c.id,
              memberType: c.memberType,
              representativeThumbnailUrl: c.thumbnailURL,
              updatedAt: getCurrentUTCDate(),
            });
          }

          const translation = dbCreatorTranslations.find(
            (translation) =>
              translation.creatorId === c.id &&
              translation.languageCode === c.languageCode,
          );

          if (!translation) {
            dbCreatorTranslations.push({
              id: createUUID(),
              creatorId: c.id,
              languageCode: c.languageCode,
              name: c.name ?? "",
              updatedAt: getCurrentUTCDate(),
            });
          }

          if (!c.channel) {
            continue;
          }

          const d = getPlatformDetail(c.channel);
          if (!d.detail) {
            continue;
          }
          const channel = dbChannels.find(
            (c) => c.platformChannelId === d.detail?.rawId,
          );

          if (!channel && !c.translated) {
            dbChannels.push({
              id: c.channel.id,
              platformChannelId: d.detail.rawId,
              creatorId: c.id,
              platformType: d.platform,
              title: d.detail.name,
              description: d.detail.description ?? "",
              thumbnailUrl: d.detail.thumbnailURL,
              publishedAt: d.detail?.publishedAt
                ? convertToUTCDate(d.detail.publishedAt)
                : getCurrentUTCDate(),
              subscriberCount: d.detail.subscriberCount ?? 0,
            });
          }
        }

        if (dbCreatorss.length > 0) {
          const creatorResult = await wrap(
            db
              .insert(creatorTable)
              .values(dbCreatorss)
              .onConflictDoUpdate({
                target: creatorTable.id,
                set: buildConflictUpdateColumns(creatorTable, [
                  "representativeThumbnailUrl",
                  "updatedAt",
                ]),
              })
              .returning()
              .execute(),
            (err) =>
              new AppError({
                message: `Database error during creator batch upsert: ${err.message}`,
                code: "INTERNAL_SERVER_ERROR",
                cause: err,
              }),
          );

          if (creatorResult.err) {
            return Err(creatorResult.err);
          }
        }

        if (dbChannels.length > 0) {
          const channelResult = await wrap(
            db
              .insert(channelTable)
              .values(dbChannels)
              .onConflictDoUpdate({
                target: channelTable.platformChannelId,
                set: buildConflictUpdateColumns(channelTable, [
                  "title",
                  "description",
                  "subscriberCount",
                  "thumbnailUrl",
                ]),
              })
              .returning()
              .execute(),
            (err) =>
              new AppError({
                message: `Database error during channel batch upsert: ${err.message}`,
                code: "INTERNAL_SERVER_ERROR",
                cause: err,
              }),
          );

          if (channelResult.err) {
            return Err(channelResult.err);
          }
        }

        if (dbCreatorTranslations.length > 0) {
          const translationResult = await wrap(
            db
              .insert(creatorTranslationTable)
              .values(dbCreatorTranslations)
              .onConflictDoUpdate({
                target: [
                  creatorTranslationTable.creatorId,
                  creatorTranslationTable.languageCode,
                ],
                set: buildConflictUpdateColumns(creatorTranslationTable, [
                  "name",
                  "languageCode",
                  "updatedAt",
                ]),
              })
              .returning()
              .execute(),
            (err) =>
              new AppError({
                message: `Database error during creator translation batch upsert: ${err.message}`,
                code: "INTERNAL_SERVER_ERROR",
                cause: err,
              }),
          );

          if (translationResult.err) {
            return Err(translationResult.err);
          }
        }

        return Ok(creators);
      },
    );
  };

  const batchDelete = async (
    creatorIds: string[],
  ): Promise<Result<void, AppError>> => {
    return withTracerResult(
      "CreatorRepository",
      "batchDelete",
      async (span) => {
        const creatorResult = await wrap(
          db
            .delete(creatorTable)
            .where(inArray(creatorTable.id, creatorIds))
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during creator batch delete: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
              cause: err,
            }),
        );

        if (creatorResult.err) {
          return Err(creatorResult.err);
        }

        return Ok();
      },
    );
  };

  const existsByChannelId = async (
    channelId: string,
  ): Promise<Result<boolean, AppError>> => {
    return withTracerResult(
      "CreatorRepository",
      "existsByChannelId",
      async (span) => {
        const result = await wrap(
          db
            .select({ count: drizzleCount() })
            .from(channelTable)
            .where(eq(channelTable.platformChannelId, channelId))
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during channel existence check: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
              cause: err,
            }),
        );

        if (result.err) {
          return Err(result.err);
        }

        return Ok((result.val.at(0)?.count ?? 0) > 0);
      },
    );
  };

  return {
    list,
    count,
    batchUpsert,
    batchDelete,
    existsByChannelId,
  };
};
