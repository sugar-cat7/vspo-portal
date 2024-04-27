package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/output"
)

// CreatorInteractor is ...
type CreatorInteractor interface {
	List(
		ctx context.Context,
		param *input.ListCreators,
	) (*output.ListCreators, error)
}
