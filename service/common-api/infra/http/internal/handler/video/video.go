package video

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
)

// ChannelsChannelIDVideosGet implements the GET /channels/{channel_id}/videos endpoint.
func (h *VH) ChannelsChannelIDVideosGet(ctx context.Context, params api.ChannelsChannelIDVideosGetParams) (api.ChannelsChannelIDVideosGetRes, error) {
	// FIXME: implement
	return &api.VideosResponse{}, nil
}

// ChannelsChannelIDVideosPut implements the PUT /channels/{channel_id}/videos endpoint.
func (h *VH) ChannelsChannelIDVideosPut(ctx context.Context, req *api.ChannelsChannelIDVideosPutReq, params api.ChannelsChannelIDVideosPutParams) (api.ChannelsChannelIDVideosPutRes, error) {
	// FIXME: implement
	return &api.VideosResponse{}, nil
}

// ChannelsChannelIDVideosPost implements the POST /channels/{channel_id}/videos endpoint.
func (h *VH) ChannelsChannelIDVideosPost(ctx context.Context, req *api.ChannelsChannelIDVideosPostReq, params api.ChannelsChannelIDVideosPostParams) (api.ChannelsChannelIDVideosPostRes, error) {
	// FIXME: implement
	return &api.VideosResponse{}, nil
}
