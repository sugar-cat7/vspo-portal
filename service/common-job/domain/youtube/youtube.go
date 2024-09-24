package youtube

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
)

//go:generate go run go.uber.org/mock/mockgen -source=$GOFILE -destination=mock/$GOFILE -package=mock_youtube
type YoutubeClient interface {
	GetVideos(ctx context.Context, param VideosParam) (model.Videos, error)
	SearchVideos(ctx context.Context, param SearchVideosParam) (model.Videos, error)
	Channels(ctx context.Context, param ChannelsParam) (model.Channels, error)
}

type VideosParam struct {
	UserIDs  []string
	VideoIDs []string
}

type SearchVideosParam struct {
	SearchQuery SearchQuery
	EventType   EventType
}

type ChannelsParam struct {
	ChannelIDs []string
}

type SearchQuery string

func (q SearchQuery) String() string {
	return string(q)
}

const (
	SearchQueryVspoJp = "ぶいすぽ"
	SearchQueryVspoEn = "VspoEN"
)

type EventType string

func (t EventType) String() string {
	return string(t)
}

const (
	EventTypeLive      = "live"
	EventTypeUpcoming  = "upcoming"
	EventTypeNone      = "none"
	EventTypeCompleted = "completed"
)
