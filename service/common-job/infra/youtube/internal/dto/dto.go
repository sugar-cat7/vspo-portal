package dto

import (
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	utime "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/time"
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
	default:
		m.Status = model.StatusEnded
	}
	if ytVideo.Snippet.PublishedAt != "" {
		publishedAt, err := utime.Utc.ISOStringToTime(ytVideo.Snippet.PublishedAt)
		if err != nil {
			return nil, err
		}
		m.PublishedAt = &publishedAt
	}

	if ytVideo.LiveStreamingDetails.ScheduledStartTime != "" {
		startAt, err := utime.Utc.ISOStringToTime(ytVideo.LiveStreamingDetails.ScheduledStartTime)
		if err != nil {
			return nil, err
		}
		m.StartedAt = &startAt
	}

	if ytVideo.LiveStreamingDetails.ActualEndTime != "" {
		endAt, err := utime.Utc.ISOStringToTime(ytVideo.LiveStreamingDetails.ActualEndTime)
		if err != nil {
			return nil, err
		}
		m.EndedAt = &endAt
		m.Status = model.StatusEnded
	}

	if ytVideo.Snippet.ChannelId != "" {
		m.CreatorInfo.ChannelID = ytVideo.Snippet.ChannelId
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
	if ytSearchResult.Snippet.PublishedAt == "" {
		publishedAt, err := utime.Utc.ISOStringToTime(ytSearchResult.Snippet.PublishedAt)
		if err != nil {
			return nil, err
		}
		m.PublishedAt = &publishedAt
	}

	if ytSearchResult.Snippet.ChannelId != "" {
		m.CreatorInfo.ChannelID = ytSearchResult.Snippet.ChannelId
	}

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
			UpdateAt:     utime.Utc.Now(),
		},
	}
	return m, nil
}
