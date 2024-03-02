package video

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase"
)

// Handler is an interface for handling clip operations.
type Handler interface {
	VideosPost(ctx context.Context, req *api.VideosPostReq) (api.VideosPostRes, error)
}

// VH is Handler implementation.
type VH struct {
	videoInteractor usecase.VideoInteractor
}

// NewHandler returns a new instance of a clip handler.
func NewHandler(
	videoInteractor usecase.VideoInteractor,
) VH {
	return VH{
		videoInteractor: videoInteractor,
	}
}
