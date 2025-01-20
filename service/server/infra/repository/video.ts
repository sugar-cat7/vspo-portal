import { eq, and, SQL, asc, count, inArray } from "drizzle-orm";
import { PlatformSchema, StatusSchema, VideoTypeSchema, Videos, createVideos } from "../../domain/video";
import { AppError, Ok, Result, Err, wrap } from "../../pkg/errors";
import { createUUID } from "../../pkg/uuid";
import { buildConflictUpdateColumns } from "./helper";
import { createInsertStreamStatus, createInsertVideo, videoTable, streamStatusTable, InsertVideo, InsertStreamStatus, channelTable, creatorTable } from "./schema";
import { DB } from "./transaction";

type ListQuery = {
    limit: number;
    page: number;
    platform?: string;
    status?: string;
    videoType?: string;
    startedAt?: Date;
    endedAt?: Date;
}

export interface IVideoRepository {
    list(query: ListQuery): Promise<Result<Videos, AppError>>;
    batchUpsert(videos: Videos): Promise<Result<Videos, AppError>>;
    count(query: ListQuery): Promise<Result<number, AppError>>;
    batchDelete(videoIds: string[]): Promise<Result<void, AppError>>;
}

export class VideoRepository implements IVideoRepository {  
    constructor(private readonly db: DB) {}

    async list(query: ListQuery): Promise<Result<Videos, AppError>> {
        const filters: SQL[] = [];
        if (query.platform) {
            filters.push(eq(videoTable.platformType, query.platform));
        }
        if (query.videoType) {
            filters.push(eq(videoTable.videoType, query.videoType));
        }
        if (query.status) {
            filters.push(eq(streamStatusTable.status, query.status));
        }
        if (query.startedAt) {
            filters.push(eq(streamStatusTable.startedAt, query.startedAt));
        }
        if (query.endedAt) {
            filters.push(eq(streamStatusTable.endedAt, query.endedAt));
        }

        const videoResult = await wrap(
            this.db.select().from(videoTable)
                .innerJoin(streamStatusTable, eq(videoTable.id, streamStatusTable.videoId))
                .innerJoin(channelTable, eq(videoTable.channelId, channelTable.platformChannelId))
                .innerJoin(creatorTable, eq(channelTable.creatorId, creatorTable.id))
                .where(and(...filters))
                .limit(query.limit)
                .offset(query.page * query.limit)
                .orderBy(asc(streamStatusTable.startedAt))
                .execute(),
            (err) => new AppError({
                message: `Database error during video list query: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );

        if (videoResult.err) {
            return Err(videoResult.err);
        }

        return Ok(createVideos(videoResult.val.map(r => ({
            id: r.video.id,
            rawChannelID: r.video.channelId,
            title: r.video.title,
            description: r.video.description,
            publishedAt: r.video.publishedAt,
            startedAt: r.stream_status.startedAt,
            endedAt: r.stream_status.endedAt,
            platform: PlatformSchema.parse(r.video.platformType),
            status: StatusSchema.parse(r.stream_status.status),
            tags: r.video.tags.split(","),
            viewCount: r.stream_status.viewCount,
            thumbnailURL: r.video.thumbnailUrl,
            videoType: VideoTypeSchema.parse(r.video.videoType),
            creatorThumbnailURL: r.creator.representativeThumbnailUrl,
        }))));
    }

    async count(query: ListQuery): Promise<Result<number, AppError>> {
        const filters: SQL[] = [];
        if (query.platform) {
            filters.push(eq(videoTable.platformType, query.platform));
        }
        if (query.status) {
            filters.push(eq(streamStatusTable.status, query.status));
        }

        const videoResult = await wrap(
            this.db.select({ count: count() }).from(videoTable)
                .innerJoin(streamStatusTable, eq(videoTable.id, streamStatusTable.videoId))
                .where(and(...filters))
                .execute(),
            (err) => new AppError({
                message: `Database error during video count query: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );

        if (videoResult.err) {
            return Err(videoResult.err);
        }

        return Ok(videoResult.val.at(0)?.count ?? 0);
    }
  
    async batchUpsert(videos: Videos): Promise<Result<Videos, AppError>> {
        const dbVideos: InsertVideo[] = [];
        const dbStreamStatus: InsertStreamStatus[] = [];
        
        for (const v of videos) {
            dbVideos.push(createInsertVideo({
                id: v.id,
                channelId: v.rawChannelID,
                platformType: v.platform,
                title: v.title,
                description: v.description,
                videoType: v.videoType,
                publishedAt: v.publishedAt,
                tags: v.tags.join(","),
                thumbnailUrl: v.thumbnailURL,
            }));
        
            dbStreamStatus.push(createInsertStreamStatus({
                id: createUUID(),
                videoId: v.id,
                status: v.status,
                startedAt: v.startedAt,
                endedAt: v.endedAt,
                viewCount: v.viewCount,
            }));
        }

        const videoResult = await wrap(
            this.db.insert(videoTable)
                .values(dbVideos)
                .onConflictDoUpdate({
                    target: videoTable.id,
                    set: buildConflictUpdateColumns(videoTable, [
                        'title',
                        'description',
                        'videoType',
                        'publishedAt',
                        'tags',
                        'thumbnailUrl'
                    ])
                })
                .returning()
                .execute(),
            (err) => new AppError({
                message: `Database error during video batch upsert: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );

        if (videoResult.err) {
            return Err(videoResult.err);
        }


        const streamStatusResult = await wrap(
            this.db.insert(streamStatusTable)
                .values(dbStreamStatus)
                .onConflictDoUpdate({
                    target: streamStatusTable.videoId,
                    set: buildConflictUpdateColumns(streamStatusTable, [
                        'status',
                        'startedAt',
                        'endedAt',
                        'viewCount',
                        'updatedAt'
                    ])
                })
                .returning()
                .execute(),
            (err) => new AppError({
                message: `Database error during stream status batch upsert: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );

        if (streamStatusResult.err) {
            return Err(streamStatusResult.err);
        }

        return Ok(createVideos(videoResult.val.map(r => ({
            id: r.id,
            rawChannelID: r.channelId,
            title: r.title,
            description: r.description,
            publishedAt: r.publishedAt,
            startedAt: null,
            endedAt: null,
            platform: PlatformSchema.parse(r.platformType),
            status: StatusSchema.parse("unknown"),
            tags: r.tags.split(","),
            viewCount: 0,
            thumbnailURL: r.thumbnailUrl,
            videoType: VideoTypeSchema.parse(r.videoType),
        }))));
    }

    async batchDelete(videoIds: string[]): Promise<Result<void, AppError>> {
        const result = await wrap(
            this.db.delete(videoTable)
                .where(inArray(videoTable.id, videoIds))
                .execute(),
            (err) => new AppError({
                message: `Database error during video batch delete: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );

        if (result.err) {
            return Err(result.err);
        }

        return Ok();
    }
}
