package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/youtube"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
)

type channelInteractor struct {
	creatorRepository repository.Creator
	channelRepository repository.Channel
	youtubeClient     youtube.YoutubeClient
}

// NewChannelInteractor creates a new ChannelInteractor
func NewChannelInteractor(
	creatorRepository repository.Creator,
	channelRepository repository.Channel,
	youtubeClient youtube.YoutubeClient,
) ChannelInteractor {
	return &channelInteractor{
		creatorRepository,
		channelRepository,
		youtubeClient,
	}
}

func (i *channelInteractor) UpsertAll(
	ctx context.Context,
	param *input.UpsertAllChannels,
) (model.Channels, error) {
	cs, err := i.creatorRepository.List(
		ctx,
		repository.ListCreatorsQuery{},
	)
	if err != nil {
		return nil, err
	}

	// NOTE: Currently only updating Youtube, treating Youtube as the representative thumbnail
	ytCs, err := i.youtubeClient.Channels(ctx, youtube.ChannelsParam{
		ChannelIDs: cs.RetrieveChannels().RetrieveYoutubeIDs(),
	})
	if err != nil {
		return nil, err
	}

	chs, err := i.channelRepository.UpsertAll(ctx, ytCs.FilterUpdateTarget(cs.RetrieveChannels()))
	if err != nil {
		return nil, err
	}
	return chs, nil
}
