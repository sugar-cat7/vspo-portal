package channel

import (
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase"
)

// CH is Handler implementation.
type CH struct {
	channelInteractor usecase.ChannelInteractor
}

// NewHandler returns a new instance of a clip handler.
func NewHandler(
	channelInteractor usecase.ChannelInteractor,
) CH {
	return CH{
		channelInteractor: channelInteractor,
	}
}
