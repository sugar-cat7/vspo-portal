package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/output"
	"github.com/volatiletech/null/v8"
)

type channelInteractor struct {
	channelRepository repository.Channel
}

func NewChannelInteractor(
	channelRepository repository.Channel,
) ChannelInteractor {
	return &channelInteractor{
		channelRepository,
	}
}

func (i *channelInteractor) List(
	ctx context.Context,
	param *input.ListChannels,
) (*output.ListChannels, error) {
	query := repository.ListChannelsQuery{
		BaseListOptions: repository.BaseListOptions{
			Page:  null.Uint64From(param.Page),
			Limit: null.Uint64From(param.Limit),
		},
	}
	channels, err := i.channelRepository.List(
		ctx,
		query,
	)
	if err != nil {
		return nil, err
	}
	ttl, err := i.channelRepository.Count(
		ctx,
		query,
	)
	if err != nil {
		return nil, err
	}
	return output.NewListChannels(
		channels,
		model.NewPagination(
			param.Page,
			param.Limit,
			ttl,
		),
	), nil
}
