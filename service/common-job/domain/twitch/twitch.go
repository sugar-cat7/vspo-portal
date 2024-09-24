package twitch

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
)

//go:generate go run go.uber.org/mock/mockgen -source=$GOFILE -destination=mock/$GOFILE -package=mock_twitch
type TwitchClient interface {
	GetVideos(ctx context.Context, param TwitchVideosParam) (model.Videos, error)
}

type TwitchVideosParam struct {
	UserIDs []string
}
