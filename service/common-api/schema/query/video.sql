-- name: CreateVideo :batchone
INSERT INTO video (
    id, channel_id, platform_name, title, description, video_type, published_at, start_at, end_at, broadcast_status, tags, view_count, thumbnail_url, is_deleted
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
)
RETURNING *;
