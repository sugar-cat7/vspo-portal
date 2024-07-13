package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database/internal/dto"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/cron/infra/database/internal/gen"
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
