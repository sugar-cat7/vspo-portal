-- name: GetStreamsByTimeRangeWithVideoType :many
SELECT
     v.*, ss.*
FROM
    video v
INNER JOIN
    stream_status ss ON v.id = ss.video_id
WHERE
    v.video_type = $1
    AND ss.started_at >= $2
    AND ss.ended_at <= $3;