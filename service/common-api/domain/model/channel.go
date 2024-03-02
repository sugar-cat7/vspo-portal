package model

import "github.com/samber/lo"

// Channel represents a channel.
type Channel struct {
	Youtube     ChannelSnippet
	Twitch      ChannelSnippet
	TwitCasting ChannelSnippet
	Niconico    ChannelSnippet
}

// ChannelSnippet represents a channel snippet.
type ChannelSnippet struct {
	ID           string
	Name         string
	Description  string
	ThumbnailURL ThumbnailURL
	IsDeleted    bool
}

// Channels represents a list of channels.
type Channels []*Channel

// RetrieveYoutubeIDs is ...
func (cs Channels) RetrieveYoutubeIDs() []string {
	ids := make([]string, len(cs))
	for i, c := range cs {
		ids[i] = c.Youtube.ID
	}
	return ids
}

// FilterUpdateTarget is ...
func (cs Channels) FilterUpdateTarget(comparisonChannels Channels) Channels {
	return lo.Filter(cs, func(newChannel *Channel, _ int) bool {
		// Check if the deleted channel is included in the existing channels
		return !lo.SomeBy(comparisonChannels, func(channel *Channel) bool {
			if channel.Youtube.ID == newChannel.Youtube.ID {
				if channel.Youtube.Description == newChannel.Youtube.Description {
					return false
				}
				if channel.Youtube.IsDeleted {
					return false
				}
			}
			return true
		})
	})
}
