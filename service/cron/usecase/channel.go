package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
)

// ChannelInteractor is ...
type ChannelInteractor interface {
	BatchUpdate(
		ctx context.Context,
		param *input.BatchUpdateChannels,
	) (model.Channels, error)
}
