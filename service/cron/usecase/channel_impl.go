package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/cron/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/youtube"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
)

type channelInteractor struct {
	transactable      repository.Transactable
	creatorRepository repository.Creator
	channelRepository repository.Channel
	youtubeClient     youtube.YoutubeClient
}

// NewChannelInteractor creates a new ChannelInteractor
func NewChannelInteractor(
	transactable repository.Transactable,
	creatorRepository repository.Creator,
	channelRepository repository.Channel,
	youtubeClient youtube.YoutubeClient,
) ChannelInteractor {
	return &channelInteractor{
		transactable,
		creatorRepository,
		channelRepository,
		youtubeClient,
	}
}

func (i *channelInteractor) BatchUpdate(
	ctx context.Context,
	param *input.UpsertChannels,
) error {
	return nil
}
