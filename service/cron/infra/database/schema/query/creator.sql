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
    creator cr
JOIN
    channel ch ON cr.id = ch.creator_id
WHERE
    cr.member_type = ANY(@member_types::text[]);


-- name: CountCreator :one
SELECT COUNT(*)
FROM
    creator;
