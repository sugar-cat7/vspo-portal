package twitcasting

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
)

type TwitcastingClient interface {
	GetVideos(ctx context.Context, param TwitcastingVideosParam) (model.Videos, error)
}

type TwitcastingVideosParam struct {
	UserIDs []string
}
