package dto

import (
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
)

func ChannelsResponse(c model.Channels) api.ChannelsResponse {
	channels := make([]api.ChannelResponse, len(c))
	for i, channel := range c {
		channels[i] = ChannelResponse(channel)
	}
	return api.ChannelsResponse{
		Channels: channels,
	}
}

func ChannelResponse(c *model.Channel) api.ChannelResponse {
	return api.ChannelResponse{
		ID: api.OptString{
			Value: c.ID,
		},
		Snippet: api.OptChannelSnippetResponse{
			Value: api.ChannelSnippetResponse{
				Youtube: api.OptPlatformSnippet{
					Value: api.PlatformSnippet{
						Title: api.OptString{
							Value: c.Snippet.Youtube.Title,
						},
						Description: api.OptString{
							Value: c.Snippet.Youtube.Description,
						},
						CustomURL: api.OptString{
							Value: c.Snippet.Youtube.CustomURL,
						},
						PublishedAt: api.OptDateTime{
							Value: c.Snippet.Youtube.PublishedAt,
						},
						Thumbnails: api.OptThumbnailsResponse{
							Value: api.ThumbnailsResponse{
								Default: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.Youtube.Thumbnails.Default.URL},
										Width:  api.OptInt{Value: c.Snippet.Youtube.Thumbnails.Default.Width},
										Height: api.OptInt{Value: c.Snippet.Youtube.Thumbnails.Default.Height},
									},
								},
								Medium: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.Youtube.Thumbnails.Medium.URL},
										Width:  api.OptInt{Value: c.Snippet.Youtube.Thumbnails.Medium.Width},
										Height: api.OptInt{Value: c.Snippet.Youtube.Thumbnails.Medium.Height},
									},
								},
								High: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.Youtube.Thumbnails.High.URL},
										Width:  api.OptInt{Value: c.Snippet.Youtube.Thumbnails.High.Width},
										Height: api.OptInt{Value: c.Snippet.Youtube.Thumbnails.High.Height},
									},
								},
							},
						},
					},
				},
				Twitch: api.OptPlatformSnippet{
					Value: api.PlatformSnippet{
						Title: api.OptString{
							Value: c.Snippet.Twitch.Title,
						},
						Description: api.OptString{
							Value: c.Snippet.Twitch.Description,
						},
						CustomURL: api.OptString{
							Value: c.Snippet.Twitch.CustomURL,
						},
						PublishedAt: api.OptDateTime{
							Value: c.Snippet.Twitch.PublishedAt,
						},
						Thumbnails: api.OptThumbnailsResponse{
							Value: api.ThumbnailsResponse{
								Default: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.Twitch.Thumbnails.Default.URL},
										Width:  api.OptInt{Value: c.Snippet.Twitch.Thumbnails.Default.Width},
										Height: api.OptInt{Value: c.Snippet.Twitch.Thumbnails.Default.Height},
									},
								},
								Medium: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.Twitch.Thumbnails.Medium.URL},
										Width:  api.OptInt{Value: c.Snippet.Twitch.Thumbnails.Medium.Width},
										Height: api.OptInt{Value: c.Snippet.Twitch.Thumbnails.Medium.Height},
									},
								},
								High: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.Twitch.Thumbnails.High.URL},
										Width:  api.OptInt{Value: c.Snippet.Twitch.Thumbnails.High.Width},
										Height: api.OptInt{Value: c.Snippet.Twitch.Thumbnails.High.Height},
									},
								},
							},
						},
					},
				},
				TwitCasting: api.OptPlatformSnippet{
					Value: api.PlatformSnippet{
						Title: api.OptString{
							Value: c.Snippet.TwitCasting.Title,
						},
						Description: api.OptString{
							Value: c.Snippet.TwitCasting.Description,
						},
						CustomURL: api.OptString{
							Value: c.Snippet.TwitCasting.CustomURL,
						},
						PublishedAt: api.OptDateTime{
							Value: c.Snippet.TwitCasting.PublishedAt,
						},
						Thumbnails: api.OptThumbnailsResponse{
							Value: api.ThumbnailsResponse{
								Default: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.TwitCasting.Thumbnails.Default.URL},
										Width:  api.OptInt{Value: c.Snippet.TwitCasting.Thumbnails.Default.Width},
										Height: api.OptInt{Value: c.Snippet.TwitCasting.Thumbnails.Default.Height},
									},
								},
								Medium: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.TwitCasting.Thumbnails.Medium.URL},
										Width:  api.OptInt{Value: c.Snippet.TwitCasting.Thumbnails.Medium.Width},
										Height: api.OptInt{Value: c.Snippet.TwitCasting.Thumbnails.Medium.Height},
									},
								},
								High: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.TwitCasting.Thumbnails.High.URL},
										Width:  api.OptInt{Value: c.Snippet.TwitCasting.Thumbnails.High.Width},
										Height: api.OptInt{Value: c.Snippet.TwitCasting.Thumbnails.High.Height},
									},
								},
							},
						},
					},
				},
				Niconico: api.OptPlatformSnippet{
					Value: api.PlatformSnippet{
						Title: api.OptString{
							Value: c.Snippet.Niconico.Title,
						},
						Description: api.OptString{
							Value: c.Snippet.Niconico.Description,
						},
						CustomURL: api.OptString{
							Value: c.Snippet.Niconico.CustomURL,
						},
						PublishedAt: api.OptDateTime{
							Value: c.Snippet.Niconico.PublishedAt,
						},
						Thumbnails: api.OptThumbnailsResponse{
							Value: api.ThumbnailsResponse{
								Default: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.Niconico.Thumbnails.Default.URL},
										Width:  api.OptInt{Value: c.Snippet.Niconico.Thumbnails.Default.Width},
										Height: api.OptInt{Value: c.Snippet.Niconico.Thumbnails.Default.Height},
									},
								},
								Medium: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.Niconico.Thumbnails.Medium.URL},
										Width:  api.OptInt{Value: c.Snippet.Niconico.Thumbnails.Medium.Width},
										Height: api.OptInt{Value: c.Snippet.Niconico.Thumbnails.Medium.Height},
									},
								},
								High: api.OptThumbnailResponse{
									Value: api.ThumbnailResponse{
										URL:    api.OptString{Value: c.Snippet.Niconico.Thumbnails.High.URL},
										Width:  api.OptInt{Value: c.Snippet.Niconico.Thumbnails.High.Width},
										Height: api.OptInt{Value: c.Snippet.Niconico.Thumbnails.High.Height},
									},
								},
							},
						},
					},
				},
			},
		},
		Statistics: api.OptChannelStatisticsResponse{
			Value: api.ChannelStatisticsResponse{
				Youtube: api.OptPlatformStatistics{
					Value: api.PlatformStatistics{
						ViewCount: api.OptString{
							Value: c.Statistics.Youtube.ViewCount,
						},
						SubscriberCount: api.OptString{
							Value: c.Statistics.Youtube.SubscriberCount,
						},
						HiddenSubscriberCount: api.OptBool{
							Value: c.Statistics.Youtube.HiddenSubscriberCount,
						},
						VideoCount: api.OptString{
							Value: c.Statistics.Youtube.VideoCount,
						},
					},
				},
				Twitch: api.OptPlatformStatistics{
					Value: api.PlatformStatistics{
						ViewCount: api.OptString{
							Value: c.Statistics.Twitch.ViewCount,
						},
						SubscriberCount: api.OptString{
							Value: c.Statistics.Twitch.SubscriberCount,
						},
						HiddenSubscriberCount: api.OptBool{
							Value: c.Statistics.Twitch.HiddenSubscriberCount,
						},
						VideoCount: api.OptString{
							Value: c.Statistics.Twitch.VideoCount,
						},
					},
				},
				TwitCasting: api.OptPlatformStatistics{
					Value: api.PlatformStatistics{
						ViewCount: api.OptString{
							Value: c.Statistics.TwitCasting.ViewCount,
						},
						SubscriberCount: api.OptString{
							Value: c.Statistics.TwitCasting.SubscriberCount,
						},
						HiddenSubscriberCount: api.OptBool{
							Value: c.Statistics.TwitCasting.HiddenSubscriberCount,
						},
						VideoCount: api.OptString{
							Value: c.Statistics.TwitCasting.VideoCount,
						},
					},
				},
				Niconico: api.OptPlatformStatistics{
					Value: api.PlatformStatistics{
						ViewCount: api.OptString{
							Value: c.Statistics.Niconico.ViewCount,
						},
						SubscriberCount: api.OptString{
							Value: c.Statistics.Niconico.SubscriberCount,
						},
						HiddenSubscriberCount: api.OptBool{
							Value: c.Statistics.Niconico.HiddenSubscriberCount,
						},
						VideoCount: api.OptString{
							Value: c.Statistics.Niconico.VideoCount,
						},
					},
				},
			}},
	}
}
