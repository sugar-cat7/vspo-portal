package repository

import (
	"context"
	"time"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
)

//go:generate go run go.uber.org/mock/mockgen -source=$GOFILE -destination=mock/$GOFILE -package=mock_repository
type Video interface {
	List(
		ctx context.Context,
		query ListVideosQuery,
	) (model.Videos, error)
	ListByIDs(
		ctx context.Context,
		query ListByIDsQuery,
	) (model.Videos, error)
	ListByTimeRange(
		ctx context.Context,
		query ListByTimeRangeQuery,
	) (model.Videos, error)
	Count(
		ctx context.Context,
		query ListVideosQuery,
	) (uint64, error)
	BatchDeleteInsert(
		ctx context.Context,
		m model.Videos,
	) (model.Videos, error)
	BatchDelete(
		ctx context.Context,
		m model.Videos,
	) error
}

// GetVideoQuery is ...
type GetVideoQuery struct {
	ID string
	BaseGetOptions
}

// ListVideosQuery is ...
type ListVideosQuery struct {
	PlatformTypes []string
	StreamStatus  []string
	VideoType     string
	BaseListOptions
}

// ListByIDsQuery is ...
type ListByIDsQuery struct {
	VideoIDs []string
}

// ListByTimeRangeQuery is ...
type ListByTimeRangeQuery struct {
	StartedAt time.Time
	EndedAt   time.Time
}
