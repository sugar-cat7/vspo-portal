-- name: CreateVideo :batchone
INSERT INTO video (
    id, channel_id, platform_type, title, description, video_type, published_at, tags, thumbnail_url, is_deleted
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
)
RETURNING *;

-- name: CreateStreamStatus :batchone
INSERT INTO stream_status (
    id, video_id, creator_id, status, updated_at,  started_at, ended_at, view_count
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;


-- name: GetVideosByPlatformsWithStatus :many
SELECT
     sqlc.embed(v), sqlc.embed(ss)
FROM
    video v
INNER JOIN
    stream_status ss ON v.id = ss.video_id
WHERE
    platform_type = ANY(@platform_types::text[])
    AND video_type = $1
LIMIT $2 OFFSET $3;

-- name: GetVideosByIDs :many
SELECT
     sqlc.embed(v)
FROM
    video v
WHERE
    id = ANY(@ids::text[]);

-- name: CountVideo :one
SELECT COUNT(*)
FROM
    video;

-- name: DeleteVideosByIDs :exec
DELETE FROM video
WHERE id = ANY(@ids::text[])
RETURNING *;


-- name: GetVideosByTimeRange :many
SELECT
     sqlc.embed(v), sqlc.embed(ss)
FROM
    video v
INNER JOIN
    stream_status ss ON v.id = ss.video_id
WHERE
    ss.started_at >= $1
    AND ss.ended_at <= $2;