import {
  type SQL,
  and,
  asc,
  count,
  countDistinct,
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
import {
  convertToUTC,
  convertToUTCDate,
  getCurrentUTCDate,
} from "../../pkg/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "../../pkg/errors";
import { AppLogger } from "../../pkg/logging";
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
}

export class CreatorRepository implements ICreatorRepository {
  constructor(private readonly db: DB) {}

  async list(query: ListQuery): Promise<Result<Creators, AppError>> {
    return withTracerResult("CreatorRepository", "list", async (span) => {
      AppLogger.info("CreatorRepository list", {
        query,
      });
      const filters = this.buildFilters(query);

      const creatorResult = await wrap(
        this.db
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
  }

  async count(query: ListQuery): Promise<Result<number, AppError>> {
    return withTracerResult("CreatorRepository", "count", async (span) => {
      const filters = this.buildFilters(query);

      const creatorResult = await wrap(
        this.db
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
          }),
      );

      if (creatorResult.err) {
        return Err(creatorResult.err);
      }

      return Ok(creatorResult.val.at(0)?.value ?? 0);
    });
  }

  async batchUpsert(creators: Creators): Promise<Result<Creators, AppError>> {
    return withTracerResult(
      "CreatorRepository",
      "batchUpsert",
      async (span) => {
        const dbCreatorss: InsertCreator[] = [];
        const dbCreatorTranslations: InsertCreatorTranslation[] = [];
        const dbChannels: InsertChannel[] = [];

        for (const c of creators) {
          const creator = dbCreatorss.find((creator) => creator.id === c.id);
          if (!creator && c.languageCode === "default") {
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

        const creatorResult = await wrap(
          this.db
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
            }),
        );

        if (creatorResult.err) {
          return Err(creatorResult.err);
        }

        const channelResult = await wrap(
          this.db
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
            }),
        );

        if (channelResult.err) {
          return Err(channelResult.err);
        }

        const creatorTranslationResult = await wrap(
          this.db
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
              message: `Database error during creator transaction batch upsert: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (creatorTranslationResult.err) {
          return Err(creatorTranslationResult.err);
        }

        return Ok(
          createCreators(
            creatorResult.val.map((r) => {
              const translation = creatorTranslationResult?.val?.find(
                (t) => t.creatorId === r.id,
              );
              return {
                id: r.id,
                name: translation?.name ?? "",
                languageCode: translation?.languageCode ?? "",
                memberType: MemberTypeSchema.parse(r.memberType),
                thumbnailURL: r.representativeThumbnailUrl,
                channel: null,
              };
            }),
          ),
        );
      },
    );
  }

  async batchDelete(creatorIds: string[]): Promise<Result<void, AppError>> {
    return withTracerResult(
      "CreatorRepository",
      "batchDelete",
      async (span) => {
        const creatorResult = await wrap(
          this.db
            .delete(creatorTable)
            .where(inArray(creatorTable.id, creatorIds))
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during creator batch delete: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (creatorResult.err) {
          return Err(creatorResult.err);
        }

        return Ok();
      },
    );
  }
  private buildFilters(query: ListQuery): SQL[] {
    const filters: SQL[] = [];
    const languageCode = query.languageCode || "default";
    if (query.memberType) {
      filters.push(eq(creatorTable.memberType, query.memberType));
    }
    filters.push(eq(creatorTranslationTable.languageCode, languageCode));
    return filters;
  }
}
