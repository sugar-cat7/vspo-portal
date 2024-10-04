package video

import (
	"context"
	"fmt"

	api "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/gen"
	dto "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/handler/video/internal"
	"github.com/sugar-cat7/vspo-portal/service/common-job/pkg/logger"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
)

// APICronVideosGet implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) APICronVideosGet(ctx context.Context, req api.APICronVideosGetParams) (api.APICronVideosGetRes, error) {
	v, err := h.videoInteractor.UpdatePlatformVideos(
		ctx,
		input.NewUpsertVideoInput(
			dto.ConvertPlatFormTypeOgenToReqSlice(req.PlatformType),
			string(req.VideoType),
			string(req.Period),
		),
	)

	if err != nil {
		logger.New().Error(err.Error())
		return nil, err
	}
	return &api.APICronVideosGetOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated videos Count: %v", len(v)),
			Set:   true,
		},
	}, nil
}
