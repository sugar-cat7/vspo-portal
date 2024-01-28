package dependency

import (
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase"
)

type Dependency struct {
	CreatorInteractor usecase.CreatorInteractor
}

func Inject() *Dependency {
	creatorInteractor := usecase.NewCreatorInteractor(
		repository.NewCreator(),
	)
	return &Dependency{
		CreatorInteractor: creatorInteractor,
	}
}
