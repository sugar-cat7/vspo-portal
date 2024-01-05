package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
)

type channel struct{}

func NewChannel() repository.Channel {
	return &channel{}
}

func (r *channel) List(
	ctx context.Context,
	query repository.ListChannelsQuery,
) (model.Channels, error) {
	// FIXME: implement
	if query.Page.Valid && query.Limit.Valid {
	}
	return model.Channels{}, nil
}

func (r *channel) Count(
	ctx context.Context,
	query repository.ListChannelsQuery,
) (uint64, error) {
	// FIXME: implement
	return 0, nil
}
