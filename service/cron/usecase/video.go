package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
)

// VideoInteractor is ...
type VideoInteractor interface {
	BatchDeleteInsert(
		ctx context.Context,
		param *input.UpsertVideos,
	) error
}
