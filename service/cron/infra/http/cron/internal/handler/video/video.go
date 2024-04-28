package video

import (
	"context"
	"fmt"

	api "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"
	dto "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/handler/video/internal"
	"github.com/sugar-cat7/vspo-portal/service/cron/pkg/logger"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
)

// CronVideosPost implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) CronVideosPost(ctx context.Context, req *api.CronVideosPostReq) (api.CronVideosPostRes, error) {
	err := h.videoInteractor.BatchDeleteInsert(
		ctx,
		input.NewUpsertVideoInput(
			dto.ConvertPlatFormTypeOgenToReqSlice(req.PlatformType),
			string(req.VideoType.Value),
			string(req.Period.Value),
		),
	)

	if err != nil {
		logger.New().Error(err.Error())
		return nil, err
	}
	return &api.CronVideosPostOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated videos"),
		},
	}, nil
}
