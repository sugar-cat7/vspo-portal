import {
  type SQL,
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  inArray,
  lte,
  or,
} from "drizzle-orm";
import { TargetLangSchema } from "../../domain/translate";
import {
  PlatformSchema,
  StatusSchema,
  VideoTypeSchema,
  type Videos,
  createVideos,
} from "../../domain/video";
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
  type InsertStreamStatus,
  type InsertVideo,
  type InsertVideoTranslation,
  channelTable,
  createInsertStreamStatus,
  createInsertVideo,
  creatorTable,
  creatorTranslationTable,
  streamStatusTable,
  videoTable,
  videoTranslationTable,
} from "./schema";
import type { DB } from "./transaction";

type ListQuery = {
  limit: number;
  page: number;
  platform?: string;
  status?: string;
  videoType?: string;
  memberType?: string;
  startedAt?: Date;
  endedAt?: Date;
  languageCode: string; // ISO 639-1 language code or [default] explicitly specified to narrow down to 1creator
  orderBy?: "asc" | "desc";
  channelIds?: string[];
  includeDeleted?: boolean;
};

export interface IVideoRepository {
  list(query: ListQuery): Promise<Result<Videos, AppError>>;
  batchUpsert(videos: Videos): Promise<Result<Videos, AppError>>;
  count(query: ListQuery): Promise<Result<number, AppError>>;
  batchDelete(videoIds: string[]): Promise<Result<void, AppError>>;
  deletedListIds(): Promise<Result<string[], AppError>>;
}

export class VideoRepository implements IVideoRepository {
  constructor(private readonly db: DB) {}

  async list(query: ListQuery): Promise<Result<Videos, AppError>> {
    return withTracerResult("VideoRepository", "list", async (span) => {
      AppLogger.info("VideoRepository list", {
        query,
      });
      const filters = this.buildFilters(query);

      const videoResult = await wrap(
        this.db
          .select()
          .from(videoTable)
          .innerJoin(
            streamStatusTable,
            eq(videoTable.rawId, streamStatusTable.videoId),
          )
          .innerJoin(
            videoTranslationTable,
            eq(videoTable.rawId, videoTranslationTable.videoId),
          )
          .innerJoin(
            channelTable,
            eq(videoTable.channelId, channelTable.platformChannelId),
          )
          .innerJoin(creatorTable, eq(channelTable.creatorId, creatorTable.id))
          .innerJoin(
            creatorTranslationTable,
            eq(creatorTable.id, creatorTranslationTable.creatorId),
          )
          .where(and(...filters))
          .orderBy(
            query.orderBy === "asc" || !query.orderBy
              ? asc(streamStatusTable.startedAt)
              : desc(streamStatusTable.startedAt),
          )
          .limit(query.limit)
          .offset(query.page * query.limit)
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during video list query: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );

      if (videoResult.err) {
        return Err(videoResult.err);
      }

      return Ok(
        createVideos(
          videoResult.val.map((r) => ({
            id: r.video.id,
            rawId: r.video.rawId,
            rawChannelID: r.video.channelId,
            title: r.video_translation.title,
            languageCode: TargetLangSchema.parse(
              r.video_translation.languageCode,
            ),
            description: r.video_translation.description,
            publishedAt: r.video.publishedAt
              ? convertToUTC(r.video.publishedAt)
              : "",
            startedAt: r.stream_status.startedAt
              ? convertToUTC(r.stream_status.startedAt)
              : null,
            endedAt: r.stream_status.endedAt
              ? convertToUTC(r.stream_status.endedAt)
              : null,
            platform: PlatformSchema.parse(r.video.platformType),
            status: StatusSchema.parse(r.stream_status.status),
            tags: r.video.tags.split(","),
            viewCount: r.stream_status.viewCount,
            thumbnailURL: r.video.thumbnailUrl,
            videoType: VideoTypeSchema.parse(r.video.videoType),
            creatorName: r.creator_translation.name,
            creatorThumbnailURL: r.creator.representativeThumbnailUrl,
            link: r.video.link ?? "",
          })),
        ),
      );
    });
  }

  async count(query: ListQuery): Promise<Result<number, AppError>> {
    return withTracerResult("VideoRepository", "count", async (span) => {
      const filters = this.buildFilters(query);

      const videoResult = await wrap(
        this.db
          .select({ value: countDistinct(videoTable.id) })
          .from(videoTable)
          .innerJoin(
            streamStatusTable,
            eq(videoTable.rawId, streamStatusTable.videoId),
          )
          .innerJoin(
            videoTranslationTable,
            eq(videoTable.rawId, videoTranslationTable.videoId),
          )
          .innerJoin(
            channelTable,
            eq(videoTable.channelId, channelTable.platformChannelId),
          )
          .innerJoin(creatorTable, eq(channelTable.creatorId, creatorTable.id))
          .innerJoin(
            creatorTranslationTable,
            eq(creatorTable.id, creatorTranslationTable.creatorId),
          )
          .where(and(...filters))
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during video count query: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );

      if (videoResult.err) {
        return Err(videoResult.err);
      }

      return Ok(videoResult.val.at(0)?.value ?? 0);
    });
  }

  async batchUpsert(videos: Videos): Promise<Result<Videos, AppError>> {
    return withTracerResult("VideoRepository", "batchUpsert", async (span) => {
      const dbVideos: InsertVideo[] = [];
      const dbStreamStatus: InsertStreamStatus[] = [];
      const dbVideoTranslation: InsertVideoTranslation[] = [];

      for (const v of videos) {
        const videoId = v.id || createUUID();
        const existingVideo = dbVideos.find((video) => video.rawId === v.rawId);
        if (!existingVideo && !v.translated) {
          dbVideos.push(
            createInsertVideo({
              id: videoId,
              rawId: v.rawId,
              channelId: v.rawChannelID,
              platformType: v.platform,
              videoType: v.videoType,
              publishedAt: convertToUTCDate(v.publishedAt),
              tags: v.tags.join(","),
              thumbnailUrl: v.thumbnailURL,
              link: v.link,
              deleted: v.deleted,
            }),
          );
        }

        const existingStreamStatus = dbStreamStatus.find(
          (status) => status.videoId === v.rawId,
        );
        if (!existingStreamStatus && !v.translated) {
          dbStreamStatus.push(
            createInsertStreamStatus({
              id: createUUID(),
              videoId: v.rawId,
              status: v.status,
              startedAt: v.startedAt ? convertToUTCDate(v.startedAt) : null,
              endedAt: v.endedAt ? convertToUTCDate(v.endedAt) : null,
              viewCount: v.viewCount,
              updatedAt: getCurrentUTCDate(),
            }),
          );
        }

        const existingTranslation = dbVideoTranslation.find(
          (translation) =>
            translation.videoId === v.rawId &&
            translation.languageCode === v.languageCode,
        );
        if (!existingTranslation) {
          dbVideoTranslation.push({
            id: createUUID(),
            videoId: v.rawId,
            languageCode: v.languageCode,
            title: v.title,
            description: v.description,
            updatedAt: getCurrentUTCDate(),
          });
        }
      }

      let videoResult: Result<(typeof videoTable.$inferSelect)[], AppError> =
        Ok([]);
      if (dbVideos.length > 0) {
        videoResult = await wrap(
          this.db
            .insert(videoTable)
            .values(dbVideos)
            .onConflictDoUpdate({
              target: videoTable.rawId,
              set: buildConflictUpdateColumns(videoTable, [
                "publishedAt",
                "tags",
                "thumbnailUrl",
                "deleted",
              ]),
            })
            .returning()
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during video batch upsert: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (videoResult.err) {
          return Err(videoResult.err);
        }
      }

      let streamStatusResult: Result<
        (typeof streamStatusTable.$inferSelect)[],
        AppError
      > = Ok([]);
      if (dbStreamStatus.length > 0) {
        streamStatusResult = await wrap(
          this.db
            .insert(streamStatusTable)
            .values(dbStreamStatus)
            .onConflictDoUpdate({
              target: streamStatusTable.videoId,
              set: buildConflictUpdateColumns(streamStatusTable, [
                "status",
                "startedAt",
                "endedAt",
                "viewCount",
                "updatedAt",
              ]),
            })
            .returning()
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during stream status batch upsert: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (streamStatusResult.err) {
          return Err(streamStatusResult.err);
        }
      }

      let videoTranslationResult: Result<
        (typeof videoTranslationTable.$inferSelect)[],
        AppError
      > = Ok([]);
      if (dbVideoTranslation.length > 0) {
        videoTranslationResult = await wrap(
          this.db
            .insert(videoTranslationTable)
            .values(dbVideoTranslation)
            .onConflictDoUpdate({
              target: [
                videoTranslationTable.videoId,
                videoTranslationTable.languageCode,
              ],
              set: buildConflictUpdateColumns(videoTranslationTable, [
                "title",
                "description",
                "updatedAt",
              ]),
            })
            .returning()
            .execute(),
          (err) =>
            new AppError({
              message: `Database error during video transaction batch upsert: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (videoTranslationResult.err) {
          return Err(videoTranslationResult.err);
        }
      }

      return Ok(
        createVideos(
          videoResult.val.map((r) => {
            const streamStatus = streamStatusResult.val.find(
              (s) => s.videoId === r.rawId,
            );
            const videoTranslation = videoTranslationResult.val.find(
              (t) => t.videoId === r.rawId,
            );

            return {
              id: r.id,
              rawId: r.rawId,
              rawChannelID: r.channelId,
              title: videoTranslation?.title ?? "",
              description: videoTranslation?.description ?? "",
              languageCode: TargetLangSchema.parse(
                videoTranslation?.languageCode ?? "default",
              ),
              publishedAt: convertToUTC(r.publishedAt),
              startedAt: streamStatus?.startedAt
                ? convertToUTC(streamStatus.startedAt)
                : null,
              endedAt: streamStatus?.endedAt
                ? convertToUTC(streamStatus.endedAt)
                : null,
              platform: PlatformSchema.parse(r.platformType),
              status: StatusSchema.parse(streamStatus?.status ?? "unknown"),
              tags: r.tags.split(","),
              viewCount: streamStatus?.viewCount ?? 0,
              thumbnailURL: r.thumbnailUrl,
              videoType: VideoTypeSchema.parse(r.videoType),
              link: r.link ?? "",
            };
          }),
        ),
      );
    });
  }

  async batchDelete(videoIds: string[]): Promise<Result<void, AppError>> {
    return withTracerResult("VideoRepository", "batchDelete", async (span) => {
      const result = await wrap(
        this.db
          .delete(videoTable)
          .where(inArray(videoTable.id, videoIds))
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during video batch delete: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );

      if (result.err) {
        return Err(result.err);
      }

      return Ok();
    });
  }

  async deletedListIds(): Promise<Result<string[], AppError>> {
    return withTracerResult(
      "VideoRepository",
      "deletedListIds",
      async (span) => {
        const result = await wrap(
          this.db
            .select({ rawId: videoTable.rawId })
            .from(videoTable)
            .where(eq(videoTable.deleted, true)),
          (err) =>
            new AppError({
              message: `Database error during video deleted list: ${err.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
        );

        if (result.err) {
          return Err(result.err);
        }

        return Ok(result.val.map((v) => v.rawId));
      },
    );
  }

  private buildFilters(query: ListQuery): SQL[] {
    const filters: SQL[] = [];
    const languageCode = query.languageCode || "default";

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
      filters.push(
        gte(streamStatusTable.startedAt, convertToUTCDate(query.startedAt)),
      );
    }
    if (query.endedAt) {
      filters.push(
        lte(streamStatusTable.endedAt, convertToUTCDate(query.endedAt)),
      );
    }

    if (!query.includeDeleted) {
      filters.push(eq(videoTable.deleted, false));
    }

    // Always add language filters with default fallback
    filters.push(eq(videoTranslationTable.languageCode, languageCode));
    filters.push(eq(creatorTranslationTable.languageCode, languageCode));

    if (query.memberType) {
      if (query.memberType !== "vspo_all") {
        filters.push(eq(creatorTable.memberType, query.memberType));
      }
    }
    if (query.channelIds && query.channelIds.length > 0) {
      filters.push(inArray(videoTable.channelId, query.channelIds));
    }

    return filters;
  }
}
