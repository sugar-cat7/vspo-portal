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
	PublishedAt  *time.Time
	StartedAt    *time.Time
	EndedAt      *time.Time
	Platform     Platform
	Status       Status
	Tags         []string
	ViewCount    uint64
	ThumbnailURL ThumbnailURL
	VideoType    VideoType
	IsDeleted    bool
	CreatorInfo  CreatorInfo
}

// Videos is a slice of pointers to Video.
type Videos []*Video

// SetVideoType sets the video type of all videos in the slice.
func (vs Videos) SetVideoType(t VideoType) Videos {
	for _, v := range vs {
		v.VideoType = t
	}
	return vs
}

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

// UpdateVideos updates existing videos with new videos information and returns the updated list of videos.
func (vs *Videos) UpdateVideos(newVideos Videos, videoType VideoType) Videos {
	existingVideoMap := make(map[string]*Video)

	for _, ev := range *vs {
		existingVideoMap[ev.ID] = ev
	}

	var targetVideos Videos
	for _, newVideo := range newVideos {
		// validate
		if newVideo.CreatorInfo.ChannelID == "" {
			continue
		}
		if newVideo.VideoType == "" {
			newVideo.VideoType = videoType
		}
		if existingVideo, exists := existingVideoMap[newVideo.ID]; exists {
			// Check for updates
			if existingVideo.Status != newVideo.Status ||
				existingVideo.StartedAt != newVideo.StartedAt ||
				existingVideo.EndedAt != newVideo.EndedAt ||
				existingVideo.Title != newVideo.Title ||
				existingVideo.ThumbnailURL != newVideo.ThumbnailURL {
				targetVideos = append(targetVideos, newVideo)
			}
			delete(existingVideoMap, newVideo.ID)
		} else {
			// Add new video
			targetVideos = append(targetVideos, newVideo)
		}
	}

	return targetVideos
}
