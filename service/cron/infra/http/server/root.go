package http

import (
	oas "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/http/server/internal/handler/creator"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/http/server/internal/handler/video"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase"
)

// Compile-time check for Handler.
var _ oas.Handler = (*RootHandler)(nil)

// RootHandler is a composite handler.
type RootHandler struct {
	creator.CH
	video.VH
}

// NewHandler creates a new instance of a RootHandler.
func NewHandler(creatorInteractor usecase.CreatorInteractor, videoInteractor usecase.VideoInteractor) *RootHandler {
	return &RootHandler{
		CH: creator.NewHandler(creatorInteractor),
		VH: video.NewHandler(videoInteractor),
	}
}
