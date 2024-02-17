package http

import (
	oas "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
)

// Compile-time check for Handler.
var _ oas.Handler = (*RootHandler)(nil)

// RootHandler is a composite handler.
type RootHandler struct {
	// channel.CH
	// video.VH
	oas.UnimplementedHandler
}

// NewRootHandler returns a new Handler.
func NewRootHandler() *RootHandler {
	// di := dependency.Inject()

	return &RootHandler{
		// VH: video.NewHandler(),
	}
}
