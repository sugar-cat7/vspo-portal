package creator

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase"
)

// Handler is an interface for handling creator operations.
type Handler interface {
	CreatorsGet(ctx context.Context, params api.CreatorsGetParams) (api.CreatorsGetRes, error)
}

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
