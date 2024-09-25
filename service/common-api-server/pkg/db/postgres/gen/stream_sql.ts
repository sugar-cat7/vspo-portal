import { Sql } from "postgres";

export const getStreamsByTimeRangeWithVideoTypeQuery = `-- name: GetStreamsByTimeRangeWithVideoType :many
SELECT
     v.id, v.channel_id, v.platform_type, v.title, v.description, v.video_type, v.published_at, v.tags, v.thumbnail_url, v.is_deleted, ss.id, ss.video_id, ss.creator_id, ss.status, ss.started_at, ss.ended_at, ss.view_count, ss.updated_at
FROM
    video v
INNER JOIN
    stream_status ss ON v.id = ss.video_id
WHERE
    v.video_type = $1
    AND ss.started_at >= $2
    AND ss.ended_at <= $3`;

export interface GetStreamsByTimeRangeWithVideoTypeArgs {
    videoType: string;
    startedAt: Date;
    endedAt: Date;
}

export interface GetStreamsByTimeRangeWithVideoTypeRow {
    id: string;
    channelId: string;
    platformType: string;
    title: string;
    description: string;
    videoType: string;
    publishedAt: Date;
    tags: string;
    thumbnailUrl: string;
    isDeleted: boolean;
    id_2: string;
    videoId: string;
    creatorId: string;
    status: string;
    startedAt: Date;
    endedAt: Date;
    viewCount: number;
    updatedAt: Date;
}

export async function getStreamsByTimeRangeWithVideoType(sql: Sql, args: GetStreamsByTimeRangeWithVideoTypeArgs): Promise<GetStreamsByTimeRangeWithVideoTypeRow[]> {
    return (await sql.unsafe(getStreamsByTimeRangeWithVideoTypeQuery, [args.videoType, args.startedAt, args.endedAt]).values()).map(row => ({
        id: row[0],
        channelId: row[1],
        platformType: row[2],
        title: row[3],
        description: row[4],
        videoType: row[5],
        publishedAt: row[6],
        tags: row[7],
        thumbnailUrl: row[8],
        isDeleted: row[9],
        id_2: row[10],
        videoId: row[11],
        creatorId: row[12],
        status: row[13],
        startedAt: row[14],
        endedAt: row[15],
        viewCount: row[16],
        updatedAt: row[17]
    }));
}

