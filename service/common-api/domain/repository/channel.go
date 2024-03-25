package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
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
	UpsertAll(
		ctx context.Context,
		m model.Channels,
	) (model.Channels, error)
}

type GetChannelQuery struct {
	ID string
	BaseGetOptions
}

type ListChannelsQuery struct {
	ChannelIDs []string
	BaseListOptions
}
