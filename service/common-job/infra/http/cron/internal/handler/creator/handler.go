package creator

import (
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase"
)

// CR is Handler implementation.
type CR struct {
	creatorInteractor usecase.CreatorInteractor
}

// NewHandler returns a new instance of a creator handler.
func NewHandler(creatorInteractor usecase.CreatorInteractor) CR {
	return CR{
		creatorInteractor: creatorInteractor,
	}
}
