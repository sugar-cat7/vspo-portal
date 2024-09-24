-- name: CreateChannel :batchone
INSERT INTO channel (
    id, platform_channel_id, creator_id, platform_type, title, description, published_at, total_view_count, subscriber_count, hidden_subscriber_count, total_video_count, thumbnail_url, updated_at, is_deleted
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
)
RETURNING *;

-- name: ExistsChannel :one
SELECT EXISTS (
    SELECT COUNT(*)
    FROM
        channel
    WHERE
        id = $1
);

-- name: UpdateChannel :one
UPDATE channel
SET
    title = $2,
    description = $3,
    thumbnail_url = $4,
    updated_at = $5
WHERE
    platform_channel_id = $1
RETURNING *;

-- name: GetChannelsByParams :many
SELECT
     *
FROM
    channel ch
WHERE
    platform_type = $1
ORDER BY updated_at ASC
LIMIT $2 OFFSET $3;
