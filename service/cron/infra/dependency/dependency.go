package dependency

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database/repository"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database/transaction"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/environment"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/twitcasting"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/twitch"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/youtube"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase"
)

type Dependency struct {
	CreatorInteractor usecase.CreatorInteractor
	VideosInteractor  usecase.VideoInteractor
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
		videosRepository,
		youtubeClient,
		twitchClient,
		twitcastingClient,
	)
	// channelInteractor := usecase.NewChannelInteractor(
	// 	creatorRepository,
	// 	// channelRepository,
	// 	youtubeClient,
	// )
	d.CreatorInteractor = creatorInteractor
	d.VideosInteractor = videoInteractor
}
