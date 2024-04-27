package video

import (
	"context"
	"fmt"

	api "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"
	dto "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/handler/video/internal"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
)

// VideosPost implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) VideosPost(ctx context.Context, req *api.VideosPostReq) (api.VideosPostRes, error) {
	err := h.videoInteractor.BatchDeleteInsert(
		ctx,
		input.NewUpsertVideoInput(
			dto.ConvertPlatFormTypeOgenToReqSlice(req.PlatformType),
			string(req.VideoType.Value),
			string(req.Period.Value),
		),
	)

	if err != nil {
		return nil, err
	}
	return &api.VideosPostOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated videos"),
		},
	}, nil
}
