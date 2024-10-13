package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
)

// VideoInteractor is ...
type VideoInteractor interface {
	UpdatePlatformVideos(
		ctx context.Context,
		param *input.UpdatePlatformVideos,
	) (int, error)
	UpdatwExistVideos(
		ctx context.Context,
		param *input.UpdateExistVideos,
	) (int, error)
}
