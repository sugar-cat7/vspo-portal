package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
)

type VideoInteractor interface {
	UpsertAll(
		ctx context.Context,
		param *input.UpsertAllVideos,
	) (model.Videos, error)
}
