-- name: GetChannelsAndVideosByCreator :many
SELECT
    sqlc.embed(cr),
    sqlc.embed(ch),
    sqlc.embed(v)
FROM
    Creator cr
JOIN
    Channel ch ON cr.id = ch.creatorId
LEFT JOIN
    Video v ON ch.id = v.channelId
WHERE
    cr.id = $1;
