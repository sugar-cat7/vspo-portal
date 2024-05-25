package http

import (
	oas "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/handler/creator"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/handler/ping"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/handler/video"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase"
)

// Compile-time check for Handler.
var _ oas.Handler = (*RootHandler)(nil)

// RootHandler is a composite handler.
type RootHandler struct {
	creator.CH
	video.VH
	ping.P
}

// NewHandler creates a new instance of a RootHandler.
func NewHandler(creatorInteractor usecase.CreatorInteractor, videoInteractor usecase.VideoInteractor) *RootHandler {
	return &RootHandler{
		P:  ping.NewHandler(),
		CH: creator.NewHandler(creatorInteractor),
		VH: video.NewHandler(videoInteractor),
	}
}
