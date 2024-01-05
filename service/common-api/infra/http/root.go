package http

import (
	oas "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/dependency"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/http/internal/handler/channel"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/http/internal/handler/video"
)

// Compile-time check for Handler.
var _ oas.Handler = (*RootHandler)(nil)

// RootHandler is a composite handler.
type RootHandler struct {
	channel.CH
	video.VH
}

// NewRootHandler returns a new Handler.
func NewRootHandler() *RootHandler {
	di := dependency.Inject()

	return &RootHandler{
		CH: channel.NewHandler(di.ChannelInteractor),
	}
}
