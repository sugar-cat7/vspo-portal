package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
)

type creator struct{}

func NewCreator() repository.Creator {
	return &creator{}
}

func (r *creator) List(
	ctx context.Context,
	query repository.ListCreatorsQuery,
) (model.Creators, error) {
	// FIXME: implement
	if query.Page.Valid && query.Limit.Valid {
	}
	return model.Creators{}, nil
}

func (r *creator) Count(
	ctx context.Context,
	query repository.ListCreatorsQuery,
) (uint64, error) {
	// FIXME: implement
	return 0, nil
}
