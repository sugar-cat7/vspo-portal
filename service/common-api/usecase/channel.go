package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/output"
)

type ChannelInteractor interface {
	List(
		ctx context.Context,
		param *input.ListChannels,
	) (*output.ListChannels, error)
}
