package video

import (
	"context"
	"fmt"

	api "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/gen"
	dto "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/handler/video/internal"
	"github.com/sugar-cat7/vspo-portal/service/common-job/pkg/logger"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
)

// APICronSearchVideosGet implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) APICronSearchVideosGet(ctx context.Context, req api.APICronSearchVideosGetParams) (api.APICronSearchVideosGetRes, error) {
	v, err := h.videoInteractor.UpdatePlatformVideos(
		ctx,
		input.NewUpsertVideoInput(
			dto.ConvertPlatFormTypeOgenToReqSlice(req.PlatformType),
			string(req.VideoType),
		),
	)

	if err != nil {
		logger.New().Error(err.Error())
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
	v, err := h.videoInteractor.UpdatwExistVideos(
		ctx,
		input.NewUpdateExistVideos(
			string(req.Period),
		),
	)

	if err != nil {
		logger.New().Error(err.Error())
		return nil, err
	}
	return &api.APICronExistVideosGetOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated videos Count: %v", v),
			Set:   true,
		},
	}, nil
}
