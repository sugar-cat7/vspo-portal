package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/volatiletech/null/v8"
)

//go:generate mockgen -source=$GOFILE -destination=mock/$GOFILE -package=mock_repository
type Channel interface {
	List(
		ctx context.Context,
		query ListChannelsQuery,
	) (model.Channels, error)
	Count(
		ctx context.Context,
		query ListChannelsQuery,
	) (uint64, error)
}

type GetChannelQuery struct {
	ID null.String
	BaseGetOptions
}

type ListChannelsQuery struct {
	BaseListOptions
}
