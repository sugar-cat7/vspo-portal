package http

import (
	oas "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
	"github.com/sugar-cat7/vspo-portal/service/common-api/internal/infra/http/internal/handler/channel"
	"github.com/sugar-cat7/vspo-portal/service/common-api/internal/infra/http/internal/handler/video"
)

// Compile-time check for Handler.
var _ oas.Handler = (*Handler)(nil)

// Handler is a composite handler.
type Handler struct {
	*channel.CH
	*video.VH
}

// NewHandler returns a new Handler.
func NewHandler() *Handler {
	return &Handler{}
}
