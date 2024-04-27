package repository

import (
	"context"
	"time"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
)

//go:generate mockgen -source=$GOFILE -destination=mock/$GOFILE -package=mock_repository
type Video interface {
	List(
		ctx context.Context,
		query ListVideosQuery,
	) (model.Videos, error)
	Count(
		ctx context.Context,
		query ListVideosQuery,
	) (uint64, error)
	UpsertAll(
		ctx context.Context,
		m model.Videos,
	) (model.Videos, error)
}

// GetVideoQuery is ...
type GetVideoQuery struct {
	ID string
	BaseGetOptions
}

// ListVideosQuery is ...
type ListVideosQuery struct {
	VideoIDs        []string
	PlatformTypes   []string
	BroadcastStatus []string
	VideoType       string
	StartedAt       time.Time
	EndedAt         time.Time
	BaseListOptions
}
