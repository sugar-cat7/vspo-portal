
-- name: GetVideos :many
SELECT
     sqlc.embed(v)
FROM
    video v;
