package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database/internal/dto"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/cron/infra/database/internal/gen"
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
	// If MemberType is specified, search by MemberType
	cs, err := client.Queries.GetCreatorsWithChannels(ctx, query.MemberTypes)
	if err != nil {
		return nil, err
	}
	res := dto.CreatorsWithChannelsRowsToModel(cs)
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

func (r *creator) BatchCreate(
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

func (r *creator) Exist(
	ctx context.Context,
	query repository.GetCreatorQuery,
) (bool, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return false, err
	}
	b, err := c.Queries.ExistsCreator(ctx, query.ID)
	if err != nil {
		return false, err
	}
	return b, nil
}
