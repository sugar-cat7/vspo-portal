package video

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
)

// Handler is an interface for handling clip operations.
type Handler interface {
	VideosPost(ctx context.Context, req *api.VideosPostReq) (api.VideosPostRes, error)
}

// VH is Handler implementation.
type VH struct{}

// NewHandler returns a new instance of a clip handler.
func NewHandler() VH {
	return VH{}
}
