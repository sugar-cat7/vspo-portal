package model

import (
	"time"
)

// Channel represents a channel.
type Channel struct {
	ID         string
	Snippet    ChannelSnippet
	Statistics ChannelStatistics
	Videos     Videos
}

// ChannelSnippet represents a channel snippet.
type Snippet struct {
	Title       string
	Description string
	CustomURL   string
	PublishedAt time.Time
	Thumbnails  Thumbnails
}

type ChannelSnippet struct {
	Youtube     Snippet
	Twitch      Snippet
	TwitCasting Snippet
	Niconico    Snippet
}

// ChannelStatistics represents a channel statistics.
type Statistics struct {
	ViewCount             string
	SubscriberCount       string
	HiddenSubscriberCount bool
	VideoCount            string
}

type ChannelStatistics struct {
	Youtube     Statistics
	Twitch      Statistics
	TwitCasting Statistics
	Niconico    Statistics
}

// Channels represents a list of channels.
type Channels []*Channel
