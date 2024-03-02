package dto

import (
	"github.com/Code-Hex/synchro"
	"github.com/Code-Hex/synchro/tz"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"google.golang.org/api/youtube/v3"
)

func ytVideoToVideo(ytVideo *youtube.Video) (*model.Video, error) {
	m := &model.Video{
		ID:           ytVideo.Id,
		Title:        ytVideo.Snippet.Title,
		Description:  ytVideo.Snippet.Description,
		Platform:     model.PlatformYouTube,
		Tags:         ytVideo.Snippet.Tags,
		ViewCount:    ytVideo.Statistics.ViewCount,
		ThumbnailURL: model.ThumbnailURL(ytVideo.Snippet.Thumbnails.Default.Url),
	}

	// Set status
	switch ytVideo.Snippet.LiveBroadcastContent {
	case "upcoming":
		m.Status = model.StatusUpcoming
	case "live":
		m.Status = model.StatusLive
	case "none":
	case "completed":
		m.Status = model.StatusEnded
	}

	publishedAt, err := synchro.ParseISO[tz.UTC](ytVideo.Snippet.PublishedAt)
	if err != nil {
		return nil, err
	}
	m.PublishedAt = publishedAt.StdTime()

	startAt, err := synchro.ParseISO[tz.UTC](ytVideo.LiveStreamingDetails.ScheduledStartTime)
	if err != nil {
		return nil, err
	}
	m.StartAt = startAt.StdTime()

	if ytVideo.LiveStreamingDetails.ActualEndTime != "" {
		endAt, err := synchro.ParseISO[tz.UTC](ytVideo.LiveStreamingDetails.ActualEndTime)
		if err != nil {
			return nil, err
		}
		m.EndAt = endAt.StdTime()
	}
	return m, nil
}

// YtVideosToVideos converts a slice of youtube.Video to a slice of model.Video.
func YtVideosToVideos(ytVideos []*youtube.Video) (model.Videos, error) {
	videos := make(model.Videos, len(ytVideos))
	for i, ytVideo := range ytVideos {
		y, err := ytVideoToVideo(ytVideo)
		if err != nil {
			return nil, err
		}
		videos[i] = y
	}
	return videos, nil
}

// YtSearchResultToVideos converts a youtube.SearchListResponse to a slice of model.Video.
func YtSearchResultToVideos(ytSearchResult *youtube.SearchListResponse) (model.Videos, error) {
	videos := make(model.Videos, len(ytSearchResult.Items))
	for i, item := range ytSearchResult.Items {
		y, err := ytSearchResultToVideo(item)
		if err != nil {
			return nil, err
		}
		videos[i] = y
	}
	return videos, nil
}

func ytSearchResultToVideo(ytSearchResult *youtube.SearchResult) (*model.Video, error) {
	m := &model.Video{
		ID:           ytSearchResult.Id.VideoId,
		Title:        ytSearchResult.Snippet.Title,
		Description:  ytSearchResult.Snippet.Description,
		Platform:     model.PlatformYouTube,
		ThumbnailURL: model.ThumbnailURL(ytSearchResult.Snippet.Thumbnails.Default.Url),
	}
	// Set status
	switch ytSearchResult.Snippet.LiveBroadcastContent {
	case "upcoming":
		m.Status = model.StatusUpcoming
	case "live":
		m.Status = model.StatusLive
	case "none":
	case "completed":
		m.Status = model.StatusEnded
	}

	publishedAt, err := synchro.ParseISO[tz.UTC](ytSearchResult.Snippet.PublishedAt)
	if err != nil {
		return nil, err
	}
	m.PublishedAt = publishedAt.StdTime()

	return m, nil
}

// YtChannelsToChannels is ...
func YtChannelsToChannels(ytChannels *youtube.ChannelListResponse) (model.Channels, error) {
	channels := make(model.Channels, len(ytChannels.Items))
	for i, ytChannel := range ytChannels.Items {
		c, err := ytChannelToChannel(ytChannel)
		if err != nil {
			return nil, err
		}
		channels[i] = c
	}
	return channels, nil
}

func ytChannelToChannel(ytChannel *youtube.Channel) (*model.Channel, error) {
	m := &model.Channel{
		Youtube: model.ChannelSnippet{
			ID:           ytChannel.Id,
			Name:         ytChannel.Snippet.Title,
			Description:  ytChannel.Snippet.Description,
			ThumbnailURL: model.ThumbnailURL(ytChannel.Snippet.Thumbnails.Default.Url),
		},
	}
	return m, nil
}
