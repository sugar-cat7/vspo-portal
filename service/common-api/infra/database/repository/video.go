package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/internal/db"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/internal/dto"
	utime "github.com/sugar-cat7/vspo-portal/service/common-api/pkg/time"
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
	res := model.Videos{}
	if query.Page.Valid && query.Limit.Valid {
		// If VideoIDs are specified, search by VideoIDs
		if len(query.VideoIDs) > 0 {
			cs, err := c.Queries.GetVideosByIDs(ctx, db_sqlc.GetVideosByIDsParams{
				Ids:    query.VideoIDs,
				Limit:  int32(query.Limit.Uint64),
				Offset: int32(query.Page.Uint64) * int32(query.Limit.Uint64),
			})
			if err != nil {
				return nil, err
			}
			res = dto.VideosByIDsRowsToModel(cs)
			return res, nil
		}
		// If PlatformType is specified, search by PlatformType
		cs, err := c.Queries.GetVideosByParams(ctx, db_sqlc.GetVideosByParamsParams{
			PlatformTypes:   query.PlatformTypes,
			VideoType:       query.VideoType,
			BroadcastStatus: query.BroadcastStatus,
			StartedAt:       utime.TimeToTimestamptz(query.StartedAt),
			EndedAt:         utime.TimeToTimestamptz(query.EndedAt),
			Limit:           int32(query.Limit.Uint64),
			Offset:          int32(query.Page.Uint64) * int32(query.Limit.Uint64),
		})
		if err != nil {
			return nil, err
		}
		res = dto.VideosByParamsRowsToModel(cs)
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
	c, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	br := c.Queries.CreateVideo(ctx, dto.VideoModelsToCreateVideoParams(m))
	defer br.Close()

	var i model.Videos
	br.QueryRow(func(_ int, ch db_sqlc.Video, err error) {
		if err != nil {
			return
		}
		i = append(i, dto.VideoToModel(&ch))
	})

	return i, nil
}
