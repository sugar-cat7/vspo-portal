package dto

import (
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
	utime "github.com/sugar-cat7/vspo-portal/service/cron/pkg/time"
)

type TwitCastingVideo struct {
	ID           string `json:"id"`
	UserID       string `json:"user_id"`
	Title        string `json:"title"`
	IsLive       bool   `json:"is_live"`
	ViewCount    int    `json:"total_view_count"`
	ThumbnailURL string `json:"large_thumbnail"`
	StartedAt    int    `json:"created"`
}

func twStreamToVideo(twStream TwitCastingVideo) *model.Video {
	t := utime.Utc.UnixToTime(int64(twStream.StartedAt), 0)
	m := &model.Video{
		ID:           twStream.ID,
		Title:        twStream.Title,
		Platform:     model.PlatformTwitCasting,
		ViewCount:    uint64(twStream.ViewCount),
		ThumbnailURL: model.ThumbnailURL(twStream.ThumbnailURL),
		Status:       status(twStream.IsLive),
		PublishedAt:  &t,
		StartedAt:    &t,
		CreatorInfo: model.CreatorInfo{
			ChannelID: twStream.UserID,
		},
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
