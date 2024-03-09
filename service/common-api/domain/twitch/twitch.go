package twitch

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
)

type TwitchClient interface {
	GetVideos(ctx context.Context, param TwitchVideosParam) (model.Videos, error)
}

type TwitchVideosParam struct {
	UserIDs []string
}