-- name: CreateCreator :batchone
INSERT INTO creator (
    id, name, member_type
) VALUES (
    $1, $2, $3
)
RETURNING *;

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
    cr.member_type = 'vspo_jp'
LIMIT $1 OFFSET $2;

