package model

import (
	"time"
)

// Video represents each platform video
type Video struct {
	ID           string
	Title        string
	Description  string
	PublishedAt  time.Time
	StartAt      time.Time
	EndAt        time.Time
	Platform     Platform
	Status       string
	Tags         []string
	ViewCount    uint64
	ThumbnailURL ThumbnailURL
	CreatorInfo  CreatorInfo
}

// Videos is a slice of pointers to Video.
type Videos []*Video

// CreatorInfo represents the information about the creator of a video.
type CreatorInfo struct {
	ID           string
	Name         string
	ThumbnailURL ThumbnailURL
}
