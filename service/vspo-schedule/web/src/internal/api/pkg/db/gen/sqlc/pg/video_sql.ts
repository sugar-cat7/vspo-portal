import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
  query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getVideosQuery = `-- name: GetVideos :many
SELECT
     v.id, v.channel_id, v.platform_type, v.title, v.description, v.video_type, v.published_at, v.started_at, v.ended_at, v.broadcast_status, v.tags, v.view_count, v.thumbnail_url, v.is_deleted
FROM
    video v`;

export interface GetVideosRow {
  video: string | null;
}

export async function getVideos(client: Client): Promise<GetVideosRow[]> {
  const result = await client.query({
    text: getVideosQuery,
    values: [],
    rowMode: "array",
  });
  return result.rows.map((row) => {
    return {
      video: row[0],
    };
  });
}
