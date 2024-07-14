package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
)

//go:generate go run go.uber.org/mock/mockgen -source=$GOFILE -destination=mock/$GOFILE -package=mock_repository
type Channel interface {
	BatchCreate(
		ctx context.Context,
		m model.Channels,
	) (model.Channels, error)
	Update(
		ctx context.Context,
		m *model.Channel,
	) (*model.Channel, error)
	List(
		ctx context.Context,
		query ListChannelQuery,
	) (model.Channels, error)
	Exist(
		ctx context.Context,
		query GetChannelQuery,
	) (bool, error)
}

type GetChannelQuery struct {
	ID string
	BaseGetOptions
}

type ListChannelQuery struct {
	PlatformType string
	BaseListOptions
}
