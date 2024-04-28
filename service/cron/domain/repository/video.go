package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
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
	BatchDeleteInsert(
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
	BaseListOptions
}
