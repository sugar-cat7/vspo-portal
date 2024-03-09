// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.25.0
// source: video.sql

package db_sqlc

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const getVideosByIDs = `-- name: GetVideosByIDs :many
SELECT
     v.id, v.channel_id, v.platform_type, v.title, v.description, v.video_type, v.published_at, v.started_at, v.ended_at, v.broadcast_status, v.tags, v.view_count, v.thumbnail_url, v.is_deleted
FROM
    video v
WHERE
    id = ANY($3::text[])
LIMIT $1 OFFSET $2
`

type GetVideosByIDsParams struct {
	Limit  int32
	Offset int32
	Ids    []string
}

type GetVideosByIDsRow struct {
	Video Video
}

func (q *Queries) GetVideosByIDs(ctx context.Context, arg GetVideosByIDsParams) ([]GetVideosByIDsRow, error) {
	rows, err := q.db.Query(ctx, getVideosByIDs, arg.Limit, arg.Offset, arg.Ids)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetVideosByIDsRow
	for rows.Next() {
		var i GetVideosByIDsRow
		if err := rows.Scan(
			&i.Video.ID,
			&i.Video.ChannelID,
			&i.Video.PlatformType,
			&i.Video.Title,
			&i.Video.Description,
			&i.Video.VideoType,
			&i.Video.PublishedAt,
			&i.Video.StartedAt,
			&i.Video.EndedAt,
			&i.Video.BroadcastStatus,
			&i.Video.Tags,
			&i.Video.ViewCount,
			&i.Video.ThumbnailUrl,
			&i.Video.IsDeleted,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getVideosByParams = `-- name: GetVideosByParams :many
SELECT
     v.id, v.channel_id, v.platform_type, v.title, v.description, v.video_type, v.published_at, v.started_at, v.ended_at, v.broadcast_status, v.tags, v.view_count, v.thumbnail_url, v.is_deleted
FROM
    video v
WHERE
    platform_type = ANY($6::text[])
    AND broadcast_status = ANY($7::text[])
    AND video_type = $1
    AND started_at >= $2
    AND ended_at <= $3
LIMIT $4 OFFSET $5
`

type GetVideosByParamsParams struct {
	VideoType       string
	StartedAt       pgtype.Timestamptz
	EndedAt         pgtype.Timestamptz
	Limit           int32
	Offset          int32
	PlatformTypes   []string
	BroadcastStatus []string
}

type GetVideosByParamsRow struct {
	Video Video
}

func (q *Queries) GetVideosByParams(ctx context.Context, arg GetVideosByParamsParams) ([]GetVideosByParamsRow, error) {
	rows, err := q.db.Query(ctx, getVideosByParams,
		arg.VideoType,
		arg.StartedAt,
		arg.EndedAt,
		arg.Limit,
		arg.Offset,
		arg.PlatformTypes,
		arg.BroadcastStatus,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetVideosByParamsRow
	for rows.Next() {
		var i GetVideosByParamsRow
		if err := rows.Scan(
			&i.Video.ID,
			&i.Video.ChannelID,
			&i.Video.PlatformType,
			&i.Video.Title,
			&i.Video.Description,
			&i.Video.VideoType,
			&i.Video.PublishedAt,
			&i.Video.StartedAt,
			&i.Video.EndedAt,
			&i.Video.BroadcastStatus,
			&i.Video.Tags,
			&i.Video.ViewCount,
			&i.Video.ThumbnailUrl,
			&i.Video.IsDeleted,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}