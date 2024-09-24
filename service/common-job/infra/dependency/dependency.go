package dependency

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/transaction"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/environment"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/twitcasting"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/twitch"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/youtube"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase"
)

type Dependency struct {
	CreatorInteractor usecase.CreatorInteractor
	VideosInteractor  usecase.VideoInteractor
	ChannelInteractor usecase.ChannelInteractor
}

func (d *Dependency) Inject(ctx context.Context, e *environment.Environment) {
	dbClient := database.NewClientPool(ctx,
		e.DatabaseEnvironment.DBHost,
		e.DatabaseEnvironment.DBUser,
		e.DatabaseEnvironment.DBPassword,
		e.DatabaseEnvironment.DBDatabase,
		e.DatabaseEnvironment.DBSSLMode,
	)
	creatorRepository := repository.NewCreator()
	channelRepository := repository.NewChannel()
	videosRepository := repository.NewVideo()
	// channelRepository := repository.NewChannel()
	youtubeClient := youtube.NewService(e.YoutubeEnvironment.YoutubeAPIKey)
	twitchClient := twitch.NewService(twitch.NewClient(e))
	twitcastingClient := twitcasting.NewService(twitcasting.NewClient(e))
	creatorInteractor := usecase.NewCreatorInteractor(
		repository.NewCreator(),
	)
	tx := transaction.NewTransactable(
		dbClient,
	)
	videoInteractor := usecase.NewVideoInteractor(
		tx,
		creatorRepository,
		channelRepository,
		videosRepository,
		youtubeClient,
		twitchClient,
		twitcastingClient,
	)
	channelInteractor := usecase.NewChannelInteractor(
		tx,
		creatorRepository,
		channelRepository,
		youtubeClient,
	)
	d.CreatorInteractor = creatorInteractor
	d.VideosInteractor = videoInteractor
	d.ChannelInteractor = channelInteractor
}
