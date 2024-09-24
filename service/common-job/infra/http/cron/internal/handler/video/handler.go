package video

import (
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase"
)

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
