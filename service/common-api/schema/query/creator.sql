-- name: CreateCreator :batchone
INSERT INTO creator (
    id, name, member_type
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: GetCreatorsWithChannels :many
SELECT
    sqlc.embed(cr),
    sqlc.embed(ch)
FROM
    Creator cr
JOIN
    Channel ch ON cr.id = ch.creatorId
WHERE
    cr.member_type = ANY(@member_types::text[])
LIMIT $1 OFFSET $2;


-- name: GetCreatorsByIDs :many
SELECT
    sqlc.embed(cr),
    sqlc.embed(ch)
FROM
    Creator cr
JOIN
    Channel ch ON cr.id = ch.creatorId
WHERE
    cr.id = ANY(@ids::text[])
LIMIT $1 OFFSET $2;
