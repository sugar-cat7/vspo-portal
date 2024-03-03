package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/internal/db"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/internal/dto"
)

type channel struct{}

// NewChannel is ...
func NewChannel() repository.Channel {
	return &channel{}
}

var _ repository.Channel = (*channel)(nil)

func (r *channel) List(
	ctx context.Context,
	query repository.ListChannelsQuery,
) (model.Channels, error) {
	_, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	res := model.Channels{}
	if query.Page.Valid && query.Limit.Valid {

	}
	return res, nil
}

func (r *channel) Count(
	ctx context.Context,
	query repository.ListChannelsQuery,
) (uint64, error) {
	// FIXME: implement
	return 0, nil
}

func (r *channel) UpsertAll(
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
