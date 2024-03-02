package dependency

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/environment"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/twitcasting"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/twitch"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/youtube"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase"
)

type Dependency struct {
	CreatorInteractor usecase.CreatorInteractor
	VideosInteractor  usecase.VideoInteractor
}

func (d *Dependency) Inject(ctx context.Context, e *environment.Environment) *Dependency {
	creatorRepository := repository.NewCreator()
	videosRepository := repository.NewVideo()
	youtubeClient := youtube.NewService(e.YoutubeEnvironment.YoutubeAPIKey)
	twitchClient := twitch.NewService(twitch.NewClient(e))
	twitcastingClient := twitcasting.NewService(twitcasting.NewClient(e))
	creatorInteractor := usecase.NewCreatorInteractor(
		repository.NewCreator(),
	)
	videoInteractor := usecase.NewVideoInteractor(
		creatorRepository,
		videosRepository,
		youtubeClient,
		twitchClient,
		twitcastingClient,
	)

	return &Dependency{
		CreatorInteractor: creatorInteractor,
		VideosInteractor:  videoInteractor,
	}
}
