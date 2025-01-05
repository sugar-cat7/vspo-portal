import { eq, and, SQL } from "drizzle-orm";
import { AppError, Ok, Result, Err, wrap } from "../../pkg/errors";
import { Database } from "./provider";
import { creatorTable, channelTable, InsertChannel, InsertCreator } from "./schema";
import { createChannel, createCreators, Creators, getPlatformDetail, MemberTypeSchema } from "../../domain";
import { getCurrentUTCDate } from "../../pkg/dayjs";
import { buildConflictUpdateColumns } from "./helper";

type ListQuery = {
    limit: number;
    offset: number;
    memberType?: string;
}

export interface ICreatorRepository {
    list(query: ListQuery): Promise<Result<Creators, AppError>>;
    batchUpsert(creators: Creators): Promise<Result<Creators, AppError>>;
}

export class CreatorRepository implements ICreatorRepository {
    private db: Database;
  
    constructor(db: Database) {
        this.db = db;
    }

    async list(query: ListQuery): Promise<Result<Creators, AppError>> {
        const filters: SQL[] = [];
        if (query.memberType) {
            filters.push(eq(creatorTable.memberType, query.memberType));
        }

        const creatorResult = await wrap(
            this.db.client.select().from(creatorTable)
                .innerJoin(channelTable, eq(creatorTable.id, channelTable.creatorId))
                .where(and(...filters))
                .limit(query.limit)
                .offset(query.offset)
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
            this.db.client.insert(creatorTable)
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
            this.db.client.insert(channelTable)
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
}
