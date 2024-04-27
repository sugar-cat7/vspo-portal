package video

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
)

// VideosGet implements the GET /channels/{channel_id}/videos endpoint.
func (h *VH) VideosGet(ctx context.Context, params api.VideosGetParams) (api.VideosGetRes, error) {
	// FIXME: implement
	return &api.VideosResponse{}, nil
}

// VideosPut implements the PUT /channels/{channel_id}/videos endpoint.
func (h *VH) VideosPut(ctx context.Context, req *api.VideosPutReq) (api.VideosPutRes, error) {
	// FIXME: implement
	return &api.VideosResponse{}, nil
}

// VideosPost implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) VideosPost(ctx context.Context, req *api.VideosPostReq) (api.VideosPostRes, error) {
	// FIXME: implement
	return &api.VideosResponse{}, nil
}
