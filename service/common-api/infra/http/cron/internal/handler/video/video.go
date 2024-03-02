package video

import (
	"context"
	"fmt"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
)

// VideosPost implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) VideosPost(ctx context.Context, req *api.VideosPostReq) (api.VideosPostRes, error) {

	vs, err := h.videoInteractor.UpsertAll(
		ctx,
		input.NewUpsertAllVideoInput(
			string(req.PlatformType.Value),
			string(req.Period.Value),
			string(req.VideoType.Value),
		),
	)

	if err != nil {
		return nil, err
	}
	return &api.VideosPostOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated videos: %d", len(vs)),
		},
	}, nil
}
