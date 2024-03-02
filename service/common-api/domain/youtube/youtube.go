package youtube

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
)

type YoutubeClient interface {
	GetVideos(ctx context.Context, param YoutubeVideosParam) (model.Videos, error)
	SearchVideos(ctx context.Context, param YoutubeSearchVideosParam) (model.Videos, error)
}

type YoutubeVideosParam struct {
	UserIDs  []string
	VideoIDs []string
}

type YoutubeSearchVideosParam struct {
	SearchQuery SearchQuery
	EventType   EventType
}

type SearchQuery string

func (q SearchQuery) String() string {
	return string(q)
}

const (
	SearchQueryVspoJp = "ぶいすぽ"
)

type EventType string

func (t EventType) String() string {
	return string(t)
}

const (
	EventTypeLive     = "live"
	EventTypeUpcoming = "upcoming"
)
