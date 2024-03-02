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
		CreatorID: api.OptString{
			Value: c.ID,
		},
		CreatorName: api.OptString{
			Value: c.Name,
		},
		ChannelInfo: api.OptChannelResponse{
			Value: ChannelResponse(&c.Channel),
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
		Youtube:     platformSnippetResponse(c.Youtube),
		Twitch:      platformSnippetResponse(c.Twitch),
		TwitCasting: platformSnippetResponse(c.TwitCasting),
		Niconico:    platformSnippetResponse(c.Niconico),
	}
}

// platformSnippetResponse converts model.PlatformSnippet to api.OptPlatformSnippet
func platformSnippetResponse(ps model.ChannelSnippet) api.OptChannelPlatformSnippet {
	return api.OptChannelPlatformSnippet{
		Value: api.ChannelPlatformSnippet{
			ChannelID:    api.OptString{Value: ps.ID},
			Name:         api.OptString{Value: ps.Name},
			Description:  api.OptString{Value: ps.Description},
			ThumbnailURL: api.OptString{Value: ps.ThumbnailURL.String()},
		},
	}
}

// VideoResponse converts model.Video to api.VideoResponse
func VideoResponse(v *model.Video) api.VideoResponse {
	return api.VideoResponse{
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
		Tags: v.Tags,
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
