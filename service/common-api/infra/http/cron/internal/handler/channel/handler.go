package channel

import (
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase"
)

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
