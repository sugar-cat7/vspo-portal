-- name: CreateVideo :batchone
INSERT INTO video (
    id, channel_id, platform_type, title, description, video_type, published_at, started_at, ended_at, tags, view_count, thumbnail_url, is_deleted
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
)
RETURNING *;

-- name: CreateBroadcastStatus :batchone
INSERT INTO broadcast_status (
    id, video_id, creator_id, status, updated_at
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING *;


-- name: GetVideosByPlatformsWithStatus :many
SELECT
     sqlc.embed(v), sqlc.embed(bs)
FROM
    video v
INNER JOIN
    broadcast_status bs ON v.id = bs.video_id
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
