package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
)

// VideoInteractor is ...
type VideoInteractor interface {
	UpdatePlatformVideos(
		ctx context.Context,
		param *input.UpdatePlatformVideos,
	) (model.Videos, error)
}
