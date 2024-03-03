package model

import (
	"fmt"
	"time"

	"github.com/samber/lo"
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
	Status       Status
	Tags         []string
	ViewCount    uint64
	ThumbnailURL ThumbnailURL
	IsDeleted    bool
	CreatorInfo  CreatorInfo
}

// Videos is a slice of pointers to Video.
type Videos []*Video

// CreatorInfo represents the information about the creator of a video.
type CreatorInfo struct {
	ID           string
	ChannelID    string
	Name         string
	ThumbnailURL ThumbnailURL
}

// VideoType represents the type of video.
type VideoType string

const (
	VideoTypeAll           VideoType = "all"
	VideoTypeVspoBroadcast VideoType = "vspo_broadcast"
	VideoTypeClip          VideoType = "clip"
	VideoTypeFreechat      VideoType = "freechat"
)

// NewVideoType is ...
func NewVideoType(s string) (VideoType, error) {
	switch s {
	case "all", "vspo_broadcast", "clip", "freechat":
		return VideoType(s), nil
	default:
		return "", fmt.Errorf("invalid VideoType: %s", s)
	}
}

func (t VideoType) String() string {
	return string(t)
}

// Status represents the status of a video.
type Status string

const (
	StatusLive     Status = "live"
	StatusUpcoming Status = "upcoming"
	StatusEnded    Status = "ended"
)

func (s Status) String() string {
	return string(s)
}

// FilterUpdateTarget videos that need to be updated
func (vs Videos) FilterUpdateTarget(comparisonVideos Videos) Videos {
	return lo.Filter(vs, func(newVideo *Video, _ int) bool {
		// Check if the deleted video is included in the existing videos
		return !lo.SomeBy(comparisonVideos, func(video *Video) bool {
			if video.ID == newVideo.ID {
				if video.Status == newVideo.Status {
					return false
				}
				if video.IsDeleted {
					return false
				}
			}
			return true
		})
	})
}

// FilterCreator filters videos by creator ID
func (vs Videos) FilterCreator(cs Creators) Videos {
	if len(cs) == 0 {
		return vs
	}
	return lo.Filter(vs, func(video *Video, _ int) bool {
		return lo.Contains(lo.Map(cs, func(c *Creator, _ int) string {
			return c.Channel.Youtube.ID
		}), video.CreatorInfo.ChannelID)
	})
}
