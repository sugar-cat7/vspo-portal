-- name: CreateVideo :batchone
INSERT INTO video (
    id, channel_id, platform_type, title, description, video_type, published_at, started_at, ended_at, broadcast_status, tags, view_count, thumbnail_url, is_deleted
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
)
RETURNING *;


-- name: GetVideosByParams :many
SELECT
     sqlc.embed(v)
FROM
    video v
WHERE
    platform_type = ANY(@platform_types::text[])
    AND broadcast_status = ANY(@broadcast_status::text[])
    AND video_type = $1;

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
