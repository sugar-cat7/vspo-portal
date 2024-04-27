package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
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
	Upsert(
		ctx context.Context,
		m model.Creators,
	) (model.Creators, error)
}

type GetCreatorQuery struct {
	ID string
	BaseGetOptions
}

// ListCreatorsQuery is ...
type ListCreatorsQuery struct {
	CreatorIDs  []string
	MemberTypes []string
	BaseListOptions
}
