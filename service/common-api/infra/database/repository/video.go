package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database"
)

type video struct{}

func NewVideo() repository.Video {
	return &video{}
}

func (r *video) List(
	ctx context.Context,
	query repository.ListVideosQuery,
) (model.Videos, error) {
	_, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	res := model.Videos{}
	if query.Page.Valid && query.Limit.Valid {

	}
	return res, nil
}

func (r *video) Count(
	ctx context.Context,
	query repository.ListVideosQuery,
) (uint64, error) {
	// FIXME: implement
	return 0, nil
}

func (r *video) UpsertAll(
	ctx context.Context,
	m model.Videos,
) (model.Videos, error) {
	_, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	return m, nil
}
