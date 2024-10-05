package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
)

//go:generate go run go.uber.org/mock/mockgen -source=$GOFILE -destination=mock/$GOFILE -package=mock_repository
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
	VideoIDs      []string
	PlatformTypes []string
	StreamStatus  []string
	VideoType     string
	BaseListOptions
}
