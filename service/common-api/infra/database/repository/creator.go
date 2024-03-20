package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/internal/db"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/internal/dto"
)

type creator struct{}

// NewCreator is ...
func NewCreator() repository.Creator {
	return &creator{}
}

var _ repository.Creator = (*creator)(nil)

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
		// If CreatorIDs are specified, search by CreatorIDs
		if len(query.CreatorIDs) > 0 {
			cs, err := client.Queries.GetCreatorsByIDs(ctx, db_sqlc.GetCreatorsByIDsParams{
				Ids:    query.CreatorIDs,
				Limit:  int32(query.Limit.Uint64),
				Offset: int32(query.Page.Uint64) * int32(query.Limit.Uint64),
			})
			if err != nil {
				return nil, err
			}
			res = dto.CreatorsByIDsRowsToModel(cs)
			return res, nil
		}
		// If MemberType is specified, search by MemberType
		cs, err := client.Queries.GetCreatorsWithChannels(ctx, db_sqlc.GetCreatorsWithChannelsParams{
			MemberTypes: query.MemberTypes,
			Limit:       int32(query.Limit.Uint64),
			Offset:      int32(query.Page.Uint64) * int32(query.Limit.Uint64),
		})
		if err != nil {
			return nil, err
		}
		res = dto.CreatorsWithChannelsRowsToModel(cs)
		return res, nil
	}
	return res, nil
}

func (r *creator) Count(
	ctx context.Context,
	_ repository.ListCreatorsQuery,
) (uint64, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return 0, err
	}
	cn, err := c.Queries.CountCreator(ctx)
	if err != nil {
		return 0, err
	}
	return uint64(cn), nil
}

func (r *creator) UpsertAll(
	ctx context.Context,
	m model.Creators,
) (model.Creators, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	br := c.Queries.CreateCreator(ctx, dto.CreatorModelsToCreateCreatorParams(m))
	defer br.Close()

	var i model.Creators
	br.QueryRow(func(_ int, ch db_sqlc.Creator, err error) {
		if err != nil {
			return
		}
		i = append(i, dto.CreatorToModel(&ch))
	})

	return i, nil
}
