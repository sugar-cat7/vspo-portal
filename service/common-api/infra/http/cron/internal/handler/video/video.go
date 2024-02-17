package video

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
)

// VideosPost implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) VideosPost(ctx context.Context, req *api.VideosPostReq) (api.VideosPostRes, error) {
	// FIXME: implement
	return &api.VideosResponse{}, nil
}
