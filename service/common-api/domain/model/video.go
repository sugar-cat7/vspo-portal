package model

import (
	"time"
)

type Video struct {
	ID          string
	ChannelID   string
	Title       string
	Description string
	PublishedAt time.Time
	StartAt     time.Time
	EndAt       time.Time
	Platform    Platform
	Status      string
	Tags        []string
	ViewCount   uint64
	Thumbnails  Thumbnails
}

type Videos []*Video
