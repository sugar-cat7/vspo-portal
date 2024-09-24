package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/internal/dto"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/internal/gen"
)

type channel struct{}

// NewChannel is ...
func NewChannel() repository.Channel {
	return &channel{}
}

var _ repository.Channel = (*channel)(nil)

func (r *channel) BatchCreate(
	ctx context.Context,
	m model.Channels,
) (model.Channels, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	br := c.Queries.CreateChannel(ctx, dto.ChannelModelsToCreateChannelParams(m))
	defer br.Close()

	var i model.Channels
	br.QueryRow(func(_ int, ch db_sqlc.Channel, err error) {
		if err != nil {
			return
		}
		i = append(i, dto.ChannelToModel(&ch))
	})

	return i, nil
}

func (r *channel) Exist(
	ctx context.Context,
	query repository.GetChannelQuery,
) (bool, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return false, err
	}
	b, err := c.Queries.ExistsChannel(ctx, query.ID)
	if err != nil {
		return false, err
	}
	return b, nil
}

func (r *channel) Update(
	ctx context.Context,
	m *model.Channel,
) (*model.Channel, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	ch, err := c.Queries.UpdateChannel(ctx, dto.ChannelModelToUpdateChannelParams(m))

	if err != nil {
		return nil, err
	}
	return dto.ChannelToModel(&ch), nil
}

func (r *channel) List(
	ctx context.Context,
	q repository.ListChannelQuery,
) (model.Channels, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	chs, err := c.Queries.GetChannelsByParams(ctx, db_sqlc.GetChannelsByParamsParams{
		PlatformType: q.PlatformType,
		Offset:       int32(q.Page.Uint64) * int32(q.Limit.Uint64),
		Limit:        int32(q.Limit.Uint64),
	})
	if err != nil {
		return nil, err
	}
	return dto.ChannelsToModel(chs), nil
}
