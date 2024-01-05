package dependency

import (
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase"
)

type Dependency struct {
	ChannelInteractor usecase.ChannelInteractor
}

func Inject() *Dependency {
	channelInteractor := usecase.NewChannelInteractor(
		repository.NewChannel(),
	)
	return &Dependency{
		ChannelInteractor: channelInteractor,
	}
}
