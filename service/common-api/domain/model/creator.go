package model

// Creator represents a content creator.
type Creator struct {
	ID           string
	Name         string
	ThumbnailURL ThumbnailURL
	Channel      Channel
	IsDeleted    bool
}

// Creators is a slice of pointers to Creator.
type Creators []*Creator

// RetrieveChannels is ...
func (cs Creators) RetrieveChannels() Channels {
	channels := make(Channels, len(cs))
	for i, c := range cs {
		channels[i] = &c.Channel
	}
	return channels
}
