package usecase

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/output"
	"github.com/volatiletech/null/v8"
)

type creatorInteractor struct {
	creatorRepository repository.Creator
}

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
	query := repository.ListCreatorsQuery{
		BaseListOptions: repository.BaseListOptions{
			Page:  null.Uint64From(param.Page),
			Limit: null.Uint64From(param.Limit),
		},
	}
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
