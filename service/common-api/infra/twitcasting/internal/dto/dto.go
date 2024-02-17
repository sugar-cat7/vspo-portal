package dto

import (
	"github.com/Code-Hex/synchro"
	"github.com/Code-Hex/synchro/tz"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
)

type TwitCastingVideo struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	IsLive       bool   `json:"is_live"`
	ViewCount    int    `json:"total_view_count"`
	ThumbnailURL string `json:"large_thumbnail"`
	StartedAt    int    `json:"created"`
}

func twStreamToVideo(twStream TwitCastingVideo) *model.Video {
	t := synchro.Unix[tz.UTC](int64(twStream.StartedAt), 0)
	m := &model.Video{
		ID:           twStream.ID,
		Title:        twStream.Title,
		Platform:     model.PlatformTwitch,
		ViewCount:    uint64(twStream.ViewCount),
		ThumbnailURL: model.ThumbnailURL(twStream.ThumbnailURL),
		Status:       status(twStream.IsLive),
		PublishedAt:  t.StdTime(),
		StartAt:      t.StdTime(),
	}

	return m
}

// TwStreamsToVideos converts a slice of TwitCastingVideo to a slice of model.Video.
func TwStreamsToVideos(twStreams []TwitCastingVideo) model.Videos {
	videos := make(model.Videos, len(twStreams))
	for i, twStream := range twStreams {
		videos[i] = twStreamToVideo(twStream)
	}
	return videos
}

func status(isLive bool) model.Status {
	if isLive {
		return model.StatusLive
	}
	return model.StatusEnded
}
