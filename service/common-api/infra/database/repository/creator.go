package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/internal/db"
)

type creator struct{}

func NewCreator() repository.Creator {
	return &creator{}
}

func (r *creator) List(
	ctx context.Context,
	query repository.ListCreatorsQuery,
) (model.Creators, error) {
	client, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	res := model.Creators{}
	if query.Page.Valid && query.Limit.Valid {

		_, err := client.Queries.GetChannelsAndVideosByCreator(ctx, db_sqlc.GetChannelsAndVideosByCreatorParams{
			Offset: int32(query.Page.Uint64),
			Limit:  int32(query.Limit.Uint64),
		})
		if err != nil {
			return nil, err
		}
	}
	return res, nil
}

func (r *creator) Count(
	ctx context.Context,
	query repository.ListCreatorsQuery,
) (uint64, error) {
	// FIXME: implement
	return 0, nil
}
