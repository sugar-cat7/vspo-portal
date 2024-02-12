package model

// Creator represents a content creator.
type Creator struct {
	ID           string
	Name         string
	ThumbnailURL ThumbnailURL
	Channel      Channel
}

// Creators is a slice of pointers to Creator.
type Creators []*Creator
