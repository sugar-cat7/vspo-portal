package repository

import (
	"context"

	"github.com/samber/lo"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database/internal/dto"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/cron/infra/database/internal/gen"
)

type video struct{}

// NewVideo is ...
func NewVideo() repository.Video {
	return &video{}
}

var _ repository.Video = (*video)(nil)

func (r *video) List(
	ctx context.Context,
	query repository.ListVideosQuery,
) (model.Videos, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}

	// If VideoIDs are specified, search by VideoIDs
	if len(query.VideoIDs) > 0 {
		cs, err := c.Queries.GetVideosByIDs(ctx, query.VideoIDs)
		if err != nil {
			return nil, err
		}
		res := dto.VideosByIDsRowsToModel(cs)
		return res, nil
	}
	// If PlatformType is specified, search by PlatformType
	cs, err := c.Queries.GetVideosByParams(ctx, db_sqlc.GetVideosByParamsParams{
		PlatformTypes:   query.PlatformTypes,
		VideoType:       query.VideoType,
		BroadcastStatus: query.BroadcastStatus,
	})
	if err != nil {
		return nil, err
	}
	res := dto.VideosByParamsRowsToModel(cs)
	return res, nil
}

func (r *video) Count(
	ctx context.Context,
	query repository.ListVideosQuery,
) (uint64, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return 0, err
	}
	cn, err := c.Queries.CountVideo(ctx)
	if err != nil {
		return 0, err
	}
	return uint64(cn), nil
}

func (r *video) BatchDeleteInsert(
	ctx context.Context,
	m model.Videos,
) (model.Videos, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}

	if c.Queries.DeleteVideosByIDs(ctx, lo.Map(m, func(v *model.Video, index int) string {
		return v.ID
	})) != nil {
		return nil, err
	}

	br := c.Queries.CreateVideo(ctx, dto.VideoModelsToCreateVideoParams(m))
	defer br.Close()

	return nil, nil
}
