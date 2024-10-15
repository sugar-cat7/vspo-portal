package video

import (
	"context"
	"fmt"

	api "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/gen"
	dto "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/handler/video/internal"
	"github.com/sugar-cat7/vspo-portal/service/common-job/pkg/logger"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
	"go.opentelemetry.io/otel/trace"
)

// APICronSearchVideosGet implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) APICronSearchVideosGet(ctx context.Context, req api.APICronSearchVideosGetParams) (api.APICronSearchVideosGetRes, error) {
	logger := logger.GetLogger(ctx)
	v, err := h.videoInteractor.UpdatePlatformVideos(
		ctx,
		input.NewUpsertVideoInput(
			dto.ConvertPlatFormTypeOgenToReqSlice(req.PlatformType),
			string(req.VideoType),
		),
	)

	if err != nil {
		span := trace.SpanFromContext(ctx)
		span.RecordError(err)
		logger.Error(err.Error())
		return nil, err
	}
	return &api.APICronSearchVideosGetOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated videos Count: %v", v),
			Set:   true,
		},
	}, nil
}

// APICronExistVideosGet implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) APICronExistVideosGet(ctx context.Context, req api.APICronExistVideosGetParams) (api.APICronExistVideosGetRes, error) {
	logger := logger.GetLogger(ctx)
	v, err := h.videoInteractor.UpdatwExistVideos(
		ctx,
		input.NewUpdateExistVideos(
			string(req.Period),
		),
	)

	if err != nil {
		span := trace.SpanFromContext(ctx)
		span.RecordError(err)
		logger.Error(err.Error())
		return nil, err
	}
	return &api.APICronExistVideosGetOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated videos Count: %v", v),
			Set:   true,
		},
	}, nil
}

// APICronSearchVideosGet implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) SearchVideos(ctx context.Context, req *api.SearchVideosReq) (api.SearchVideosRes, error) {
	logger := logger.GetLogger(ctx)
	v, err := h.videoInteractor.UpdatePlatformVideos(
		ctx,
		input.NewUpsertVideoInput(
			dto.ConvertPostPlatFormTypeOgenToReqSlice(req.PlatformType),
			string(req.VideoType.Value),
		),
	)

	if err != nil {
		span := trace.SpanFromContext(ctx)
		span.RecordError(err)
		logger.Error(err.Error())
		return nil, err
	}
	return &api.SearchVideosOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated videos Count: %v", v),
			Set:   true,
		},
	}, nil
}

// APICronExistVideosGet implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) ExistVideos(ctx context.Context, req *api.ExistVideosReq) (api.ExistVideosRes, error) {
	logger := logger.GetLogger(ctx)
	v, err := h.videoInteractor.UpdatwExistVideos(
		ctx,
		input.NewUpdateExistVideos(
			string(req.Period.Value),
		),
	)

	if err != nil {
		span := trace.SpanFromContext(ctx)
		span.RecordError(err)
		logger.Error(err.Error())
		return nil, err
	}
	return &api.ExistVideosOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated videos Count: %v", v),
			Set:   true,
		},
	}, nil
}
