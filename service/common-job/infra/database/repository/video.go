package repository

import (
	"context"
	"fmt"

	"github.com/samber/lo"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/internal/dto"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/internal/gen"
	utime "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/time"
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
	// If PlatformType is specified, search by PlatformType
	cs, err := c.Queries.GetVideosByPlatformsWithStatus(ctx, db_sqlc.GetVideosByPlatformsWithStatusParams{
		PlatformTypes: query.PlatformTypes,
		VideoType:     query.VideoType,
		Limit:         int32(query.Limit.Uint64),
		Offset:        int32(query.Page.Uint64 * query.Limit.Uint64),
	})
	if err != nil {
		return nil, err
	}
	res := dto.VideosByParamsRowsToModel(cs)
	return res, nil
}

func (r *video) ListByIDs(
	ctx context.Context,
	query repository.ListByIDsQuery,
) (model.Videos, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	cs, err := c.Queries.GetVideosByIDs(ctx, query.VideoIDs)
	if err != nil {
		return nil, err
	}
	res := dto.VideosByIDsRowsToModel(cs)
	return res, nil
}

func (r *video) ListByTimeRange(
	ctx context.Context,
	query repository.ListByTimeRangeQuery,
) (model.Videos, error) {
	c, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	vs, err := c.Queries.GetVideosByTimeRange(ctx, db_sqlc.GetVideosByTimeRangeParams{
		StartedAt: utime.TimeToTimestamptz(query.StartedAt),
		EndedAt:   utime.TimeToTimestamptz(query.EndedAt),
	})

	if err != nil {
		return nil, err
	}

	return dto.GetVideosByTimeRangeRowsToModel(vs), nil
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
	var videoErrors []error
	br.QueryRow(func(i int, video db_sqlc.Video, err error) {
		if err != nil {
			videoErrors = append(videoErrors, err)
		}
	})

	if len(videoErrors) > 0 {
		return nil, fmt.Errorf("failed to insert videos: %v", videoErrors)
	}

	bbs := c.Queries.CreateStreamStatus(ctx, dto.VideoModelsToCreateStreamStatusParams(m))
	defer bbs.Close()
	var streamStatusErrors []error
	bbs.QueryRow(func(i int, streamStatus db_sqlc.StreamStatus, err error) {
		if err != nil {
			streamStatusErrors = append(streamStatusErrors, err)
		}
	})

	if len(streamStatusErrors) > 0 {
		return nil, fmt.Errorf("failed to insert stream status: %v", streamStatusErrors)
	}

	return nil, nil
}

func (r *video) BatchDelete(
	ctx context.Context,
	m model.Videos,
) error {
	c, err := database.FromContext(ctx)
	if err != nil {
		return err
	}

	if c.Queries.DeleteVideosByIDs(ctx, lo.Map(m, func(v *model.Video, index int) string {
		return v.ID
	})) != nil {
		return err
	}

	return nil
}
