-- name: CreateChannel :batchone
INSERT INTO channel (
    id, creator_id, platform_name, title, description, published_at, total_view_count, subscriber_count, hidden_subscriber_count, total_video_count, thumbnail_url, is_deleted
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
)
RETURNING *;
