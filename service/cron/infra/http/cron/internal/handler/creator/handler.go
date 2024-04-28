package creator

import (
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase"
)

// CH is Handler implementation.
type CH struct {
	creatorInteractor usecase.CreatorInteractor
}

// NewHandler returns a new instance of a creator handler.
func NewHandler(creatorInteractor usecase.CreatorInteractor) CH {
	return CH{
		creatorInteractor: creatorInteractor,
	}
}
