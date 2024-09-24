package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
)

//go:generate go run go.uber.org/mock/mockgen -source=$GOFILE -destination=mock/$GOFILE -package=mock_repository
type Creator interface {
	List(
		ctx context.Context,
		query ListCreatorsQuery,
	) (model.Creators, error)
	Count(
		ctx context.Context,
		query ListCreatorsQuery,
	) (uint64, error)
	BatchCreate(
		ctx context.Context,
		m model.Creators,
	) (model.Creators, error)
	Exist(
		ctx context.Context,
		query GetCreatorQuery,
	) (bool, error)
}

type GetCreatorQuery struct {
	ID string
	BaseGetOptions
}

// ListCreatorsQuery is ...
type ListCreatorsQuery struct {
	BaseListOptions
	MemberTypes []string
}
