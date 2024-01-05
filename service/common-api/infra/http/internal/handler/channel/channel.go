package channel

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
)

// ChannelsGet implements the GET /channels endpoint.
func (h *CH) ChannelsGet(ctx context.Context, params api.ChannelsGetParams) (api.ChannelsGetRes, error) {
	// FIXME: implement
	return &api.ChannelsResponse{}, nil
}

// ChannelsPost implements the POST /channels endpoint.
func (h *CH) ChannelsPost(ctx context.Context, params *api.ChannelsPostReq) (api.ChannelsPostRes, error) {
	// FIXME: implement
	return &api.ChannelsResponse{}, nil
}

// ChannelsPut implements the PUT /channels endpoint.
func (h *CH) ChannelsPut(ctx context.Context, params *api.ChannelsPutReq) (api.ChannelsPutRes, error) {
	// FIXME: implement
	return &api.ChannelsResponse{}, nil
}
