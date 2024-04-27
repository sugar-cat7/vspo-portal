package dto

import (
	twitch "github.com/Adeithe/go-twitch/api"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
)

func twVideoToVideo(twVideo twitch.Video) *model.Video {
	return &model.Video{
		ID:           twVideo.ID,
		Title:        twVideo.Title,
		Platform:     model.PlatformTwitch,
		ViewCount:    uint64(twVideo.ViewCount),
		ThumbnailURL: model.ThumbnailURL(twVideo.ThumbnailURL),
		Status:       model.StatusEnded,
		PublishedAt:  twVideo.PublishedAt,
		// EndedAt:
	}
}

// TwVideosToVideos converts a slice of twitch.Video to a slice of model.Video.
func TwVideosToVideos(twVideos []twitch.Video) model.Videos {
	videos := make(model.Videos, len(twVideos))
	for i, twVideo := range twVideos {
		videos[i] = twVideoToVideo(twVideo)
	}
	return videos
}

func twStreamToVideo(twStream twitch.Stream) *model.Video {
	m := &model.Video{
		ID:           twStream.ID,
		Title:        twStream.Title,
		Platform:     model.PlatformTwitch,
		Tags:         twStream.Tags,
		ViewCount:    uint64(twStream.ViewerCount),
		ThumbnailURL: model.ThumbnailURL(twStream.ThumbnailURL),
		Status:       model.StatusLive,
		PublishedAt:  twStream.StartedAt,
		StartedAt:    twStream.StartedAt,
	}

	return m
}

// TwStreamsToVideos converts a slice of twitch.Stream to a slice of model.Video.
func TwStreamsToVideos(twStreams []twitch.Stream) model.Videos {
	videos := make(model.Videos, len(twStreams))
	for i, twStream := range twStreams {
		videos[i] = twStreamToVideo(twStream)
	}
	return videos
}
