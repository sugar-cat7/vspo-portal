package creator

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase"
)

// Handler is an interface for handling creator operations.
type Handler interface {
	ChannelsPost(ctx context.Context, params api.ChannelsPostReq) (api.ChannelsPostRes, error)
}

// CH is Handler implementation.
type CH struct {
	creatorInteractor usecase.ChannelInteractor
}

// NewHandler returns a new instance of a creator handler.
func NewHandler(creatorInteractor usecase.ChannelInteractor) CH {
	return CH{
		creatorInteractor: creatorInteractor,
	}
}
