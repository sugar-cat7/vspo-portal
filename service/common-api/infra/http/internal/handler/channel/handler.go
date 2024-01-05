package channel

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase"
)

// Handler is an interface for handling channel operations.
type Handler interface {
	ChannelsGet(ctx context.Context, params api.ChannelsGetParams) (api.ChannelsGetRes, error)
	ChannelsPost(ctx context.Context, params *api.ChannelsPostReq) (api.ChannelsPostRes, error)
	ChannelsPut(ctx context.Context, params *api.ChannelsPutReq) (api.ChannelsPutRes, error)
}

// CH is Handler implementation.
type CH struct {
	channelInteractor usecase.ChannelInteractor
}

// NewHandler returns a new instance of a channel handler.
func NewHandler(channelInteractor usecase.ChannelInteractor) CH {
	return CH{
		channelInteractor: channelInteractor,
	}
}
