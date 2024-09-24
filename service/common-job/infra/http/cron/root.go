package http

import (
	oas "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/gen"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/handler/channel"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/handler/creator"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/handler/ping"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/handler/video"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase"
)

// Compile-time check for Handler.
var _ oas.Handler = (*RootHandler)(nil)

// RootHandler is a composite handler.
type RootHandler struct {
	creator.CR
	video.VH
	ping.P
	channel.CH
}

// NewHandler creates a new instance of a RootHandler.
func NewHandler(
	creatorInteractor usecase.CreatorInteractor,
	videoInteractor usecase.VideoInteractor,
	channelInteractor usecase.ChannelInteractor,
) *RootHandler {
	return &RootHandler{
		P:  ping.NewHandler(),
		CR: creator.NewHandler(creatorInteractor),
		VH: video.NewHandler(videoInteractor),
		CH: channel.NewHandler(channelInteractor),
	}
}
