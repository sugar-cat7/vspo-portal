package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
)

// ChannelInteractor is ...
type ChannelInteractor interface {
	BatchUpdate(
		ctx context.Context,
		param *input.BatchUpdateChannels,
	) (model.Channels, error)
}
