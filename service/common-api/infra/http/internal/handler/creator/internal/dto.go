package dto

import (
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
)

// CreatorsResponse converts model.Creators to []api.CreatorResponse
func CreatorsResponse(c model.Creators) []api.CreatorResponse {
	creators := make([]api.CreatorResponse, len(c))
	for i, creator := range c {
		creators[i] = CreatorResponse(creator)
	}
	return creators
}

// CreatorResponse converts model.Creator to api.CreatorResponse
func CreatorResponse(c *model.Creator) api.CreatorResponse {
	return api.CreatorResponse{
		ID: api.OptString{
			Value: c.ID,
		},
		Name: api.OptString{
			Value: c.Name,
		},
		Channels: ChannelsResponse(c.Channels),
	}
}

// ThumbnailsResponse converts model.Thumbnails to api.OptThumbnailsResponse
func ThumbnailsResponse(t model.Thumbnails) api.OptThumbnailsResponse {
	return api.OptThumbnailsResponse{
		Value: api.ThumbnailsResponse{
			Default: thumbnailResponse(t.Default),
			Medium:  thumbnailResponse(t.Medium),
			High:    thumbnailResponse(t.High),
		},
	}
}

// thumbnailResponse converts model.Thumbnail to api.OptThumbnailResponse
func thumbnailResponse(t model.Thumbnail) api.OptThumbnailResponse {
	return api.OptThumbnailResponse{
		Value: api.ThumbnailResponse{
			URL:    api.OptString{Value: t.URL},
			Width:  api.OptInt{Value: t.Width},
			Height: api.OptInt{Value: t.Height},
		},
	}
}

// ChannelsResponse creates a slice of api.ChannelResponse from model.Channels
func ChannelsResponse(c model.Channels) []api.ChannelResponse {
	channels := make([]api.ChannelResponse, len(c))
	for i, channel := range c {
		channels[i] = ChannelResponse(channel)
	}
	return channels
}

// ChannelResponse converts model.Channel to api.ChannelResponse
func ChannelResponse(c *model.Channel) api.ChannelResponse {
	return api.ChannelResponse{
		ID: api.OptString{
			Value: c.ID,
		},
		Snippet: api.OptChannelSnippetResponse{
			Value: api.ChannelSnippetResponse{
				Youtube:     platformSnippetResponse(c.Snippet.Youtube),
				Twitch:      platformSnippetResponse(c.Snippet.Twitch),
				TwitCasting: platformSnippetResponse(c.Snippet.TwitCasting),
				Niconico:    platformSnippetResponse(c.Snippet.Niconico),
			},
		},
		Statistics: api.OptChannelStatisticsResponse{
			Value: api.ChannelStatisticsResponse{
				Youtube:     platformStatisticsResponse(c.Statistics.Youtube),
				Twitch:      platformStatisticsResponse(c.Statistics.Twitch),
				TwitCasting: platformStatisticsResponse(c.Statistics.TwitCasting),
				Niconico:    platformStatisticsResponse(c.Statistics.Niconico),
			}},
	}
}

// platformSnippetResponse converts model.PlatformSnippet to api.OptPlatformSnippet
func platformSnippetResponse(ps model.Snippet) api.OptPlatformSnippet {
	return api.OptPlatformSnippet{
		Value: api.PlatformSnippet{
			Title:       api.OptString{Value: ps.Title},
			Description: api.OptString{Value: ps.Description},
			CustomURL:   api.OptString{Value: ps.CustomURL},
			PublishedAt: api.OptDateTime{Value: ps.PublishedAt},
			Thumbnails:  ThumbnailsResponse(ps.Thumbnails),
		},
	}
}

// platformStatisticsResponse converts model.PlatformStatistics to api.OptPlatformStatistics
func platformStatisticsResponse(ps model.Statistics) api.OptPlatformStatistics {
	return api.OptPlatformStatistics{
		Value: api.PlatformStatistics{
			ViewCount:             api.OptString{Value: ps.ViewCount},
			SubscriberCount:       api.OptString{Value: ps.SubscriberCount},
			HiddenSubscriberCount: api.OptBool{Value: ps.HiddenSubscriberCount},
			VideoCount:            api.OptString{Value: ps.VideoCount},
		},
	}
}

// VideoResponse converts model.Video to api.VideoResponse
func VideoResponse(v *model.Video) api.VideoResponse {
	return api.VideoResponse{
		ID: api.OptString{
			Value: v.ID,
		},
		ChannelId: api.OptString{
			Value: v.ChannelID,
		},
		Title: api.OptString{
			Value: v.Title,
		},
		Description: api.OptString{
			Value: v.Description,
		},
		PublishedAt: api.OptDateTime{
			Value: v.PublishedAt,
		},
		StartAt: api.OptDateTime{
			Value: v.StartAt,
		},
		EndAt: api.OptDateTime{
			Value: v.EndAt,
		},
		Tags:       v.Tags,
		Thumbnails: ThumbnailsResponse(v.Thumbnails),
		Platform: api.OptVideoResponsePlatform{
			Value: api.VideoResponsePlatform(v.Platform.String()),
		},
	}
}

// PaginationResponse converts model.Pagination to api.OptPagination
func PaginationResponse(p *model.Pagination) api.OptPagination {
	return api.OptPagination{
		Value: api.Pagination{
			CurrentPage: api.OptInt64{Value: int64(p.CurrentPage)},
			PrevPage:    api.OptInt64{Value: int64(p.PrevPage)},
			NextPage:    api.OptInt64{Value: int64(p.NextPage)},
			TotalPage:   api.OptInt64{Value: int64(p.TotalPage)},
			TotalCount:  api.OptInt64{Value: int64(p.TotalCount)},
			HasNext:     api.OptBool{Value: p.HasNext},
		},
	}
}
