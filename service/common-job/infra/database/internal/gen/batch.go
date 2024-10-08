// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: batch.go

package db_sqlc

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var (
	ErrBatchAlreadyClosed = errors.New("batch already closed")
)

const createBroadcastStatus = `-- name: CreateBroadcastStatus :batchone
INSERT INTO broadcast_status (
    id, video_id, creator_id, status, updated_at
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING id, video_id, creator_id, status, updated_at
`

type CreateBroadcastStatusBatchResults struct {
	br     pgx.BatchResults
	tot    int
	closed bool
}

type CreateBroadcastStatusParams struct {
	ID        string
	VideoID   string
	CreatorID string
	Status    string
	UpdatedAt pgtype.Timestamptz
}

func (q *Queries) CreateBroadcastStatus(ctx context.Context, arg []CreateBroadcastStatusParams) *CreateBroadcastStatusBatchResults {
	batch := &pgx.Batch{}
	for _, a := range arg {
		vals := []interface{}{
			a.ID,
			a.VideoID,
			a.CreatorID,
			a.Status,
			a.UpdatedAt,
		}
		batch.Queue(createBroadcastStatus, vals...)
	}
	br := q.db.SendBatch(ctx, batch)
	return &CreateBroadcastStatusBatchResults{br, len(arg), false}
}

func (b *CreateBroadcastStatusBatchResults) QueryRow(f func(int, BroadcastStatus, error)) {
	defer b.br.Close()
	for t := 0; t < b.tot; t++ {
		var i BroadcastStatus
		if b.closed {
			if f != nil {
				f(t, i, ErrBatchAlreadyClosed)
			}
			continue
		}
		row := b.br.QueryRow()
		err := row.Scan(
			&i.ID,
			&i.VideoID,
			&i.CreatorID,
			&i.Status,
			&i.UpdatedAt,
		)
		if f != nil {
			f(t, i, err)
		}
	}
}

func (b *CreateBroadcastStatusBatchResults) Close() error {
	b.closed = true
	return b.br.Close()
}

const createChannel = `-- name: CreateChannel :batchone
INSERT INTO channel (
    id, platform_channel_id, creator_id, platform_type, title, description, published_at, total_view_count, subscriber_count, hidden_subscriber_count, total_video_count, thumbnail_url, updated_at, is_deleted
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
)
RETURNING id, platform_channel_id, creator_id, platform_type, title, description, published_at, total_view_count, subscriber_count, hidden_subscriber_count, total_video_count, thumbnail_url, updated_at, is_deleted
`

type CreateChannelBatchResults struct {
	br     pgx.BatchResults
	tot    int
	closed bool
}

type CreateChannelParams struct {
	ID                    string
	PlatformChannelID     string
	CreatorID             string
	PlatformType          string
	Title                 string
	Description           string
	PublishedAt           pgtype.Timestamptz
	TotalViewCount        int32
	SubscriberCount       int32
	HiddenSubscriberCount bool
	TotalVideoCount       int32
	ThumbnailUrl          string
	UpdatedAt             pgtype.Timestamptz
	IsDeleted             bool
}

func (q *Queries) CreateChannel(ctx context.Context, arg []CreateChannelParams) *CreateChannelBatchResults {
	batch := &pgx.Batch{}
	for _, a := range arg {
		vals := []interface{}{
			a.ID,
			a.PlatformChannelID,
			a.CreatorID,
			a.PlatformType,
			a.Title,
			a.Description,
			a.PublishedAt,
			a.TotalViewCount,
			a.SubscriberCount,
			a.HiddenSubscriberCount,
			a.TotalVideoCount,
			a.ThumbnailUrl,
			a.UpdatedAt,
			a.IsDeleted,
		}
		batch.Queue(createChannel, vals...)
	}
	br := q.db.SendBatch(ctx, batch)
	return &CreateChannelBatchResults{br, len(arg), false}
}

func (b *CreateChannelBatchResults) QueryRow(f func(int, Channel, error)) {
	defer b.br.Close()
	for t := 0; t < b.tot; t++ {
		var i Channel
		if b.closed {
			if f != nil {
				f(t, i, ErrBatchAlreadyClosed)
			}
			continue
		}
		row := b.br.QueryRow()
		err := row.Scan(
			&i.ID,
			&i.PlatformChannelID,
			&i.CreatorID,
			&i.PlatformType,
			&i.Title,
			&i.Description,
			&i.PublishedAt,
			&i.TotalViewCount,
			&i.SubscriberCount,
			&i.HiddenSubscriberCount,
			&i.TotalVideoCount,
			&i.ThumbnailUrl,
			&i.UpdatedAt,
			&i.IsDeleted,
		)
		if f != nil {
			f(t, i, err)
		}
	}
}

func (b *CreateChannelBatchResults) Close() error {
	b.closed = true
	return b.br.Close()
}

const createCreator = `-- name: CreateCreator :batchone
INSERT INTO creator (
    id, name, member_type
) VALUES (
    $1, $2, $3
)
RETURNING id, name, member_type
`

type CreateCreatorBatchResults struct {
	br     pgx.BatchResults
	tot    int
	closed bool
}

type CreateCreatorParams struct {
	ID         string
	Name       string
	MemberType string
}

func (q *Queries) CreateCreator(ctx context.Context, arg []CreateCreatorParams) *CreateCreatorBatchResults {
	batch := &pgx.Batch{}
	for _, a := range arg {
		vals := []interface{}{
			a.ID,
			a.Name,
			a.MemberType,
		}
		batch.Queue(createCreator, vals...)
	}
	br := q.db.SendBatch(ctx, batch)
	return &CreateCreatorBatchResults{br, len(arg), false}
}

func (b *CreateCreatorBatchResults) QueryRow(f func(int, Creator, error)) {
	defer b.br.Close()
	for t := 0; t < b.tot; t++ {
		var i Creator
		if b.closed {
			if f != nil {
				f(t, i, ErrBatchAlreadyClosed)
			}
			continue
		}
		row := b.br.QueryRow()
		err := row.Scan(&i.ID, &i.Name, &i.MemberType)
		if f != nil {
			f(t, i, err)
		}
	}
}

func (b *CreateCreatorBatchResults) Close() error {
	b.closed = true
	return b.br.Close()
}

const createVideo = `-- name: CreateVideo :batchone
INSERT INTO video (
    id, channel_id, platform_type, title, description, video_type, published_at, started_at, ended_at, tags, view_count, thumbnail_url, is_deleted
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
)
RETURNING id, channel_id, platform_type, title, description, video_type, published_at, started_at, ended_at, tags, view_count, thumbnail_url, is_deleted
`

type CreateVideoBatchResults struct {
	br     pgx.BatchResults
	tot    int
	closed bool
}

type CreateVideoParams struct {
	ID           string
	ChannelID    string
	PlatformType string
	Title        string
	Description  string
	VideoType    string
	PublishedAt  pgtype.Timestamptz
	StartedAt    pgtype.Timestamptz
	EndedAt      pgtype.Timestamptz
	Tags         string
	ViewCount    int32
	ThumbnailUrl string
	IsDeleted    bool
}

func (q *Queries) CreateVideo(ctx context.Context, arg []CreateVideoParams) *CreateVideoBatchResults {
	batch := &pgx.Batch{}
	for _, a := range arg {
		vals := []interface{}{
			a.ID,
			a.ChannelID,
			a.PlatformType,
			a.Title,
			a.Description,
			a.VideoType,
			a.PublishedAt,
			a.StartedAt,
			a.EndedAt,
			a.Tags,
			a.ViewCount,
			a.ThumbnailUrl,
			a.IsDeleted,
		}
		batch.Queue(createVideo, vals...)
	}
	br := q.db.SendBatch(ctx, batch)
	return &CreateVideoBatchResults{br, len(arg), false}
}

func (b *CreateVideoBatchResults) QueryRow(f func(int, Video, error)) {
	defer b.br.Close()
	for t := 0; t < b.tot; t++ {
		var i Video
		if b.closed {
			if f != nil {
				f(t, i, ErrBatchAlreadyClosed)
			}
			continue
		}
		row := b.br.QueryRow()
		err := row.Scan(
			&i.ID,
			&i.ChannelID,
			&i.PlatformType,
			&i.Title,
			&i.Description,
			&i.VideoType,
			&i.PublishedAt,
			&i.StartedAt,
			&i.EndedAt,
			&i.Tags,
			&i.ViewCount,
			&i.ThumbnailUrl,
			&i.IsDeleted,
		)
		if f != nil {
			f(t, i, err)
		}
	}
}

func (b *CreateVideoBatchResults) Close() error {
	b.closed = true
	return b.br.Close()
}
