package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
)

// ChannelInteractor is ...
type ChannelInteractor interface {
	UpsertAll(
		ctx context.Context,
		param *input.UpsertAllChannels,
	) (model.Channels, error)
}
