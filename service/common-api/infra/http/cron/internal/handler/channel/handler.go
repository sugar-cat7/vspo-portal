package channel

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase"
)

// Handler is an interface for handling channel operations.
type Handler interface {
	ChannelsPost(ctx context.Context, req *api.ChannelsPostReq) (api.ChannelsPostRes, error)
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
