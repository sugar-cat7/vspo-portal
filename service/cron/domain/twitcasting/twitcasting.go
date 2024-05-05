package twitcasting

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
)

//go:generate go run go.uber.org/mock/mockgen -source=$GOFILE -destination=mock/$GOFILE -package=mock_twitcasting
type TwitcastingClient interface {
	GetVideos(ctx context.Context, param TwitcastingVideosParam) (model.Videos, error)
}

type TwitcastingVideosParam struct {
	UserIDs []string
}
