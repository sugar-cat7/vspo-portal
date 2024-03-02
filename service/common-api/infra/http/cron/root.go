package http

import (
	oas "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/http/cron/internal/handler/channel"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/http/cron/internal/handler/video"
)

// Compile-time check for Handler.
var _ oas.Handler = (*RootHandler)(nil)

// RootHandler is a composite handler.
type RootHandler struct {
	channel.CH
	video.VH
}
