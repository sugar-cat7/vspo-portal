package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/output"
)

type creatorInteractor struct {
	creatorRepository repository.Creator
}

// NewCreatorInteractor is ...
func NewCreatorInteractor(
	creatorRepository repository.Creator,
) CreatorInteractor {
	return &creatorInteractor{
		creatorRepository,
	}
}

func (i *creatorInteractor) List(
	ctx context.Context,
	param *input.ListCreators,
) (*output.ListCreators, error) {
	query := repository.ListCreatorsQuery{}
	creators, err := i.creatorRepository.List(
		ctx,
		query,
	)
	if err != nil {
		return nil, err
	}
	ttl, err := i.creatorRepository.Count(
		ctx,
		query,
	)
	if err != nil {
		return nil, err
	}
	return output.NewListCreators(
		creators,
		model.NewPagination(
			param.Page,
			param.Limit,
			ttl,
		),
	), nil
}
