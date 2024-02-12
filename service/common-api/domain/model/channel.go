package model

// Channel represents a channel.
type Channel struct {
	Youtube     ChannelSnippet
	Twitch      ChannelSnippet
	TwitCasting ChannelSnippet
	Niconico    ChannelSnippet
}

// ChannelSnippet represents a channel snippet.
type ChannelSnippet struct {
	ChannelID    string
	Name         string
	Description  string
	ThumbnailURL ThumbnailURL
}

// Channels represents a list of channels.
type Channels []*Channel
