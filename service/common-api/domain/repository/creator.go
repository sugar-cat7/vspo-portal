package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/volatiletech/null/v8"
)

//go:generate mockgen -source=$GOFILE -destination=mock/$GOFILE -package=mock_repository
type Creator interface {
	List(
		ctx context.Context,
		query ListCreatorsQuery,
	) (model.Creators, error)
	Count(
		ctx context.Context,
		query ListCreatorsQuery,
	) (uint64, error)
}

type GetCreatorQuery struct {
	ID null.String
	BaseGetOptions
}

type ListCreatorsQuery struct {
	CreatorID null.String
	BaseListOptions
}
