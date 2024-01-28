package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/output"
)

type CreatorInteractor interface {
	List(
		ctx context.Context,
		param *input.ListCreators,
	) (*output.ListCreators, error)
}
