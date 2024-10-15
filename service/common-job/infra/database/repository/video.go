package repository

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel/codes"

	"github.com/samber/lo"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/internal/dto"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/internal/gen"
	trace "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/otel"
	utime "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/time"
)

type video struct{}

// NewVideo creates a new video repository.
func NewVideo() repository.Video {
	return &video{}
}

var _ repository.Video = (*video)(nil)

// List retrieves a list of videos based on the provided query.
func (r *video) List(
	ctx context.Context,
	query repository.ListVideosQuery,
) (model.Videos, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "Repository#Video/List")
	defer span.End()

	c, err := database.FromContext(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get database connection")
		return nil, err
	}

	// Execute the query to retrieve videos by platform and status.
	cs, err := c.Queries.GetVideosByPlatformsWithStatus(ctx, db_sqlc.GetVideosByPlatformsWithStatusParams{
		PlatformTypes: query.PlatformTypes,
		VideoType:     query.VideoType,
		Limit:         int32(query.Limit.Uint64),
		Offset:        int32(query.Page.Uint64 * query.Limit.Uint64),
	})
	if err != nil {
		span.SetStatus(codes.Error, "Failed to fetch videos")
		return nil, err
	}

	res := dto.VideosByParamsRowsToModel(cs)
	return res, nil
}

// ListByIDs retrieves videos based on their IDs.
func (r *video) ListByIDs(
	ctx context.Context,
	query repository.ListByIDsQuery,
) (model.Videos, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "Repository#Video/ListByIDs")
	defer span.End()

	c, err := database.FromContext(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get database connection")
		return nil, err
	}

	// Execute the query to fetch videos by their IDs.
	cs, err := c.Queries.GetVideosByIDs(ctx, query.VideoIDs)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to fetch videos by IDs")
		return nil, err
	}

	res := dto.VideosByIDsRowsToModel(cs)
	return res, nil
}

// ListByTimeRange retrieves videos within a specified time range.
func (r *video) ListByTimeRange(
	ctx context.Context,
	query repository.ListByTimeRangeQuery,
) (model.Videos, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "Repository#Video/ListByTimeRange")
	defer span.End()

	c, err := database.FromContext(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get database connection")
		return nil, err
	}

	// Execute the query to fetch videos within the specified time range.
	vs, err := c.Queries.GetVideosByTimeRange(ctx, db_sqlc.GetVideosByTimeRangeParams{
		StartedAt: utime.TimeToTimestamptz(query.StartedAt),
		EndedAt:   utime.TimeToTimestamptz(query.EndedAt),
	})
	if err != nil {
		span.SetStatus(codes.Error, "Failed to fetch videos by time range")
		return nil, err
	}

	return dto.GetVideosByTimeRangeRowsToModel(vs), nil
}

// Count returns the total number of videos that match the provided query.
func (r *video) Count(
	ctx context.Context,
	query repository.ListVideosQuery,
) (uint64, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "Repository#Video/Count")
	defer span.End()

	c, err := database.FromContext(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get database connection")
		return 0, err
	}

	// Execute the query to count the videos.
	cn, err := c.Queries.CountVideo(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to count videos")
		return 0, err
	}

	return uint64(cn), nil
}

// BatchDeleteInsert performs a batch delete and insert operation for videos.
func (r *video) BatchDeleteInsert(
	ctx context.Context,
	m model.Videos,
) (model.Videos, error) {

	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "Repository#Video/BatchDeleteInsert")
	defer span.End()

	c, err := database.FromContext(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get database connection")
		return nil, err
	}

	// Delete videos by IDs.
	if c.Queries.DeleteVideosByIDs(ctx, lo.Map(m, func(v *model.Video, index int) string {
		return v.ID
	})) != nil {
		span.SetStatus(codes.Error, "Failed to delete videos")
		return nil, err
	}

	// Insert new videos.
	br := c.Queries.CreateVideo(ctx, dto.VideoModelsToCreateVideoParams(m))
	defer br.Close()
	var videoErrors []error
	br.QueryRow(func(i int, video db_sqlc.Video, err error) {
		if err != nil {
			videoErrors = append(videoErrors, err)
		}
	})

	if len(videoErrors) > 0 {
		span.SetStatus(codes.Error, "Failed to insert videos")
		return nil, fmt.Errorf("failed to insert videos: %v", videoErrors)
	}

	// Insert stream status for videos.
	bbs := c.Queries.CreateStreamStatus(ctx, dto.VideoModelsToCreateStreamStatusParams(m))
	defer bbs.Close()
	var streamStatusErrors []error
	bbs.QueryRow(func(i int, streamStatus db_sqlc.StreamStatus, err error) {
		if err != nil {
			streamStatusErrors = append(streamStatusErrors, err)
		}
	})

	if len(streamStatusErrors) > 0 {
		span.SetStatus(codes.Error, "Failed to insert stream status")
		return nil, fmt.Errorf("failed to insert stream status: %v", streamStatusErrors)
	}

	return nil, nil
}

// BatchDelete performs a batch delete operation for videos.
func (r *video) BatchDelete(
	ctx context.Context,
	m model.Videos,
) error {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "Repository#Video/BatchDelete")
	defer span.End()

	c, err := database.FromContext(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get database connection")
		return err
	}

	// Delete videos by IDs.
	if c.Queries.DeleteVideosByIDs(ctx, lo.Map(m, func(v *model.Video, index int) string {
		return v.ID
	})) != nil {
		span.SetStatus(codes.Error, "Failed to delete videos")
		return err
	}

	return nil
}
