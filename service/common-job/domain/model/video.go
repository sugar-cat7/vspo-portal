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

// VideoIDs returns a slice of video IDs.
func (vs Videos) IDs() []string {
	return lo.Map(vs, func(v *Video, _ int) string {
		return v.ID
	})
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
	VideoTypeVspoStream VideoType = "vspo_stream"
	VideoTypeClip       VideoType = "clip"
	VideoTypeFreechat   VideoType = "freechat"
)

// NewVideoType is ...
func NewVideoType(s string) (VideoType, error) {
	switch s {
	case "all", "vspo_stream", "clip", "freechat":
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

func (vs Videos) FilterByChannels(channels Channels) Videos {
	var filteredVideos Videos
	for _, v := range vs {
		for _, c := range channels {
			if v.CreatorInfo.ChannelID == c.Youtube.ID ||
				v.CreatorInfo.ChannelID == c.Twitch.ID ||
				v.CreatorInfo.ChannelID == c.TwitCasting.ID {
				filteredVideos = append(filteredVideos, v)
				break
			}
		}
	}
	return filteredVideos
}

func (vs Videos) UpdateCreatorInfo(cs Creators) Videos {
	for i := range vs {
		for _, c := range cs {
			updated := false
			switch vs[i].Platform {
			case PlatformYouTube:
				if vs[i].CreatorInfo.ChannelID == c.Channel.Youtube.ID {
					vs[i].CreatorInfo.ID = c.ID
					vs[i].CreatorInfo.Name = c.Name
					vs[i].CreatorInfo.ThumbnailURL = c.ThumbnailURL
					updated = true
				}
			case PlatformTwitch:
				if vs[i].CreatorInfo.ChannelID == c.Channel.Twitch.ID {
					vs[i].CreatorInfo.ID = c.ID
					vs[i].CreatorInfo.Name = c.Name
					vs[i].CreatorInfo.ThumbnailURL = c.ThumbnailURL
					updated = true
				}
			case PlatformTwitCasting:
				if vs[i].CreatorInfo.ChannelID == c.Channel.TwitCasting.ID {
					vs[i].CreatorInfo.ID = c.ID
					vs[i].CreatorInfo.Name = c.Name
					vs[i].CreatorInfo.ThumbnailURL = c.ThumbnailURL
					updated = true
				}
			}
			if updated {
				break
			}
		}
	}
	return vs
}

func (vs Videos) FilterUpdatedVideos(comparedVideos Videos) Videos {
	var updatedVideos Videos
	// Create a map for quick lookup of comparedVideos by ID
	comparedVideosMap := make(map[string]*Video)
	// Create a map to track already added video IDs
	addedVideoIDs := make(map[string]bool)

	for _, comparedVideo := range comparedVideos {
		comparedVideosMap[comparedVideo.ID] = comparedVideo
	}

	// Iterate through the videos in vs
	for _, v := range vs {
		comparedVideo, exists := comparedVideosMap[v.ID]

		// If the video has already been added, skip it
		if addedVideoIDs[v.ID] {
			continue
		}

		// If the video does not exist in comparedVideos, add it to updatedVideos
		if !exists {
			updatedVideos = append(updatedVideos, v)
			addedVideoIDs[v.ID] = true
			continue
		}

		// Truncate time to seconds for comparison
		startedAtEqual := (v.StartedAt == nil && comparedVideo.StartedAt == nil) ||
			(v.StartedAt != nil && comparedVideo.StartedAt != nil && v.StartedAt.Truncate(time.Second).Equal(comparedVideo.StartedAt.Truncate(time.Second)))
		endedAtEqual := (v.EndedAt == nil && comparedVideo.EndedAt == nil) ||
			(v.EndedAt != nil && comparedVideo.EndedAt != nil && v.EndedAt.Truncate(time.Second).Equal(comparedVideo.EndedAt.Truncate(time.Second)))
		// If the video exists but its properties differ, add it to updatedVideos
		if v.Title != comparedVideo.Title ||
			v.ThumbnailURL != comparedVideo.ThumbnailURL ||
			!startedAtEqual ||
			!endedAtEqual ||
			v.Status != comparedVideo.Status {
			updatedVideos = append(updatedVideos, v)
			addedVideoIDs[v.ID] = true
		}
	}

	return updatedVideos
}

func (vs Videos) FilterDeletedVideos(comparedVideos Videos) Videos {
	var deletedVideos Videos
	// Create a map for quick lookup of comparedVideos by ID
	comparedVideosMap := make(map[string]*Video)

	for _, comparedVideo := range comparedVideos {
		comparedVideosMap[comparedVideo.ID] = comparedVideo
	}

	for _, v := range vs {
		// If the video does not exist in comparedVideos, add it to deletedVideos
		if _, exists := comparedVideosMap[v.ID]; !exists {
			deletedVideos = append(deletedVideos, v)
		}
	}

	return deletedVideos
}
