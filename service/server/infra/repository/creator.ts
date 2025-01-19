import { eq, and, SQL, count, inArray } from "drizzle-orm";
import { AppError, Ok, Result, Err, wrap } from "../../pkg/errors";
import { creatorTable, channelTable, InsertChannel, InsertCreator } from "./schema";
import { createChannel, createCreators, Creators, getPlatformDetail, MemberTypeSchema } from "../../domain";
import { getCurrentUTCDate } from "../../pkg/dayjs";
import { buildConflictUpdateColumns } from "./helper";
import { DB } from "./transaction";

type ListQuery = {
    limit: number;
    page: number;
    memberType?: string;
}

export interface ICreatorRepository {
    list(query: ListQuery): Promise<Result<Creators, AppError>>;
    count(query: ListQuery): Promise<Result<number, AppError>>;
    batchUpsert(creators: Creators): Promise<Result<Creators, AppError>>;
    batchDelete(creatorIds: string[]): Promise<Result<void, AppError>>;
}

export class CreatorRepository implements ICreatorRepository {
    constructor(private readonly db: DB) {}

    async list(query: ListQuery): Promise<Result<Creators, AppError>> {
        const filters: SQL[] = [];
        if (query.memberType) {
            filters.push(eq(creatorTable.memberType, query.memberType));
        }

        const creatorResult = await wrap(
            this.db.select().from(creatorTable)
                .innerJoin(channelTable, eq(creatorTable.id, channelTable.creatorId))
                .where(and(...filters))
                .limit(query.limit)
                .offset(query.page * query.limit)
                .execute(),
            (err) => new AppError({
                message: `Database error during creator list query: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );

        if (creatorResult.err) {
            return Err(creatorResult.err);
        }

        return Ok(createCreators(creatorResult.val.map(r => ({
            id: r.creator.id,
            name: r.creator.name,
            memberType: MemberTypeSchema.parse(r.creator.memberType),
            thumbnailURL: r.creator.representativeThumbnailUrl,
            channel: createChannel({
                id: r.channel.id,
                creatorID: r.creator.id,
                youtube: r.channel.platformType === 'youtube' ? {
                    rawId: r.channel.platformChannelId,
                    name: r.channel.title,
                    description: r.channel.description,
                    publishedAt: r.channel.publishedAt,
                    thumbnailURL: r.channel.thumbnailUrl,
                    subscriberCount: r.channel.subscriberCount,
                } : null,
                twitch: r.channel.platformType === 'twitch' ? {
                    rawId: r.channel.platformChannelId,
                    name: r.channel.title,
                    description: r.channel.description,
                    publishedAt: r.channel.publishedAt,
                    thumbnailURL: r.channel.thumbnailUrl,
                    subscriberCount: r.channel.subscriberCount,
                } : null,
                twitCasting: r.channel.platformType === 'twitcasting'  ? {
                    rawId: r.channel.platformChannelId,
                    name: r.channel.title,
                    description: r.channel.description,
                    publishedAt: r.channel.publishedAt,
                    thumbnailURL: r.channel.thumbnailUrl,
                    subscriberCount: r.channel.subscriberCount,
                } : null,
                niconico: r.channel.platformType === 'niconico' ? {
                    rawId: r.channel.platformChannelId,
                    name: r.channel.title,
                    description: r.channel.description,
                    publishedAt: r.channel.publishedAt,
                    thumbnailURL: r.channel.thumbnailUrl,
                    subscriberCount: r.channel.subscriberCount,
                } : null,
            })
        }))));
    }

    async count(query: ListQuery): Promise<Result<number, AppError>> {
        const filters: SQL[] = [];
        if (query.memberType) {
            filters.push(eq(creatorTable.memberType, query.memberType));
        }

        const creatorResult = await wrap(
            this.db.select({ count: count()}).from(creatorTable)
                .innerJoin(channelTable, eq(creatorTable.id, channelTable.creatorId))
                .where(and(...filters))
                .execute(),
            (err) => new AppError({
                message: `Database error during creator count query: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );

        if (creatorResult.err) {
            return Err(creatorResult.err);
        }

        return Ok(creatorResult.val.at(0)?.count ?? 0);
    }

    async batchUpsert(creators: Creators): Promise<Result<Creators, AppError>> {
        const dbCreatorss: InsertCreator[] = [];
        const dbChannels: InsertChannel[] = [];

        for (const c of creators) {
            dbCreatorss.push({
                id: c.id,
                name: c.name,
                memberType: c.memberType,
                representativeThumbnailUrl: c.thumbnailURL,
            });

            if (!c.channel) {
                continue;
            }
            
            const d = getPlatformDetail(c.channel);
            if (!d.detail) {
                continue;
            }
            dbChannels.push({
                id: c.channel.id,
                platformChannelId: d.detail.rawId,
                creatorId: c.id,
                platformType: d.platform,
                title: d.detail.name,
                description: d.detail.description ?? '',
                thumbnailUrl: d.detail.thumbnailURL,
                publishedAt: d.detail.publishedAt ?? getCurrentUTCDate(),
                subscriberCount: d.detail.subscriberCount ?? 0,
            });

        }

        const creatorResult = await wrap(
            this.db.insert(creatorTable)
                .values(dbCreatorss)
                .onConflictDoUpdate({
                    target: creatorTable.id,
                    set: buildConflictUpdateColumns(creatorTable, [
                        'name',
                        'representativeThumbnailUrl'
                    ])
                })
                .returning()
                .execute(),
            (err) => new AppError({
                message: `Database error during creator batch upsert: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );

        if (creatorResult.err) {
            return Err(creatorResult.err);
        }


        const channelResult = await wrap(
            this.db.insert(channelTable)
                .values(dbChannels)
                .onConflictDoUpdate({
                    target: creatorTable.id,
                    set: buildConflictUpdateColumns(channelTable, [
                        'title',
                        'description',
                        'subscriberCount',
                        'thumbnailUrl',
                    ])
                })
                .returning()
                .execute(),
            (err) => new AppError({
                message: `Database error during channel batch upsert: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );

        if (channelResult.err) {
            return Err(channelResult.err);
        }

        return Ok(createCreators(creatorResult.val.map(r => ({
            id: r.id,
            name: r.name,
            memberType: MemberTypeSchema.parse(r.memberType),
            thumbnailURL: r.representativeThumbnailUrl,
            channel: null,
        }))));
    }

    async batchDelete(creatorIds: string[]): Promise<Result<void, AppError>> {
        const creatorResult = await wrap(
            this.db.delete(creatorTable)
                .where(inArray(creatorTable.id, creatorIds))
                .execute(),
            (err) => new AppError({
                message: `Database error during creator batch delete: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );

        if (creatorResult.err) {
            return Err(creatorResult.err);
        }

        return Ok();
    }
}
