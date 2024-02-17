package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/volatiletech/null/v8"
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

type GetVideoQuery struct {
	ID null.String
	BaseGetOptions
}

type ListVideosQuery struct {
	VideoIDs []*null.String
	BaseListOptions
}
