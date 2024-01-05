package video

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
)

// Handler is an interface for handling clip operations.
type Handler interface {
	ChannelsChannelIDVideosGet(ctx context.Context, params api.ChannelsChannelIDVideosGetParams) (api.ChannelsChannelIDVideosGetRes, error)
	ChannelsChannelIDVideosPut(ctx context.Context, req *api.ChannelsChannelIDVideosPutReq, params api.ChannelsChannelIDVideosPutParams) (api.ChannelsChannelIDVideosPutRes, error)
	ChannelsChannelIDVideosPost(ctx context.Context, req *api.ChannelsChannelIDVideosPostReq, params api.ChannelsChannelIDVideosPostParams) (api.ChannelsChannelIDVideosPostRes, error)
}

// VH is Handler implementation.
type VH struct{}

// NewHandler returns a new instance of a clip handler.
func NewHandler() Handler {
	return &VH{}
}
