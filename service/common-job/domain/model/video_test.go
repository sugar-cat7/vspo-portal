package model_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
)

func TestVideos_SetVideoType(t *testing.T) {
	tests := []struct {
		name      string
		videos    model.Videos
		inputType model.VideoType
		wantType  model.VideoType
	}{
		{
			name: "set all to vspo_stream",
			videos: model.Videos{
				&model.Video{ID: "1", VideoType: model.VideoTypeClip},
				&model.Video{ID: "2", VideoType: model.VideoTypeFreechat},
			},
			inputType: model.VideoTypeVspoStream,
			wantType:  model.VideoTypeVspoStream,
		},
		{
			name: "set all to clip",
			videos: model.Videos{
				&model.Video{ID: "1", VideoType: model.VideoTypeFreechat},
				&model.Video{ID: "2", VideoType: model.VideoTypeVspoStream},
			},
			inputType: model.VideoTypeClip,
			wantType:  model.VideoTypeClip,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			updatedVideos := tt.videos.SetVideoType(tt.inputType)
			for _, v := range updatedVideos {
				assert.Equal(t, tt.wantType, v.VideoType)
			}
		})
	}
}

func TestVideos_IDs(t *testing.T) {
	tests := []struct {
		name   string
		videos model.Videos
		want   []string
	}{
		{
			name: "multiple videos",
			videos: model.Videos{
				&model.Video{ID: "1"},
				&model.Video{ID: "2"},
				&model.Video{ID: "3"},
			},
			want: []string{"1", "2", "3"},
		},
		{
			name: "single video",
			videos: model.Videos{
				&model.Video{ID: "1"},
			},
			want: []string{"1"},
		},
		{
			name:   "no videos",
			videos: model.Videos{},
			want:   []string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ids := tt.videos.IDs()
			assert.Equal(t, tt.want, ids)
		})
	}
}

func TestVideos_FilterUpdatedVideos(t *testing.T) {
	now := time.Now()
	later := now.Add(10 * time.Minute)

	tests := []struct {
		name           string
		videos         model.Videos
		comparedVideos model.Videos
		want           model.Videos
	}{
		{
			name: "one video updated",
			videos: model.Videos{
				&model.Video{ID: "1", Title: "Old Title", Status: model.StatusLive, StartedAt: &now},
				&model.Video{ID: "2", Title: "Same Title", Status: model.StatusUpcoming, StartedAt: &now},
			},
			comparedVideos: model.Videos{
				&model.Video{ID: "1", Title: "New Title", Status: model.StatusLive, StartedAt: &now},
				&model.Video{ID: "2", Title: "Same Title", Status: model.StatusUpcoming, StartedAt: &now},
			},
			want: model.Videos{
				&model.Video{ID: "1", Title: "Old Title", Status: model.StatusLive, StartedAt: &now},
			},
		},
		{
			name: "no videos updated",
			videos: model.Videos{
				&model.Video{ID: "1", Title: "Same Title", Status: model.StatusLive, StartedAt: &now},
			},
			comparedVideos: model.Videos{
				&model.Video{ID: "1", Title: "Same Title", Status: model.StatusLive, StartedAt: &now},
			},
			want: model.Videos{},
		},
		{
			name: "start time updated",
			videos: model.Videos{
				&model.Video{ID: "1", Title: "Same Title", Status: model.StatusLive, StartedAt: &now},
			},
			comparedVideos: model.Videos{
				&model.Video{ID: "1", Title: "Same Title", Status: model.StatusLive, StartedAt: &later},
			},
			want: model.Videos{
				&model.Video{ID: "1", Title: "Same Title", Status: model.StatusLive, StartedAt: &now},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			updatedVideos := tt.videos.FilterUpdatedVideos(tt.comparedVideos)
			assert.Equal(t, len(tt.want), len(updatedVideos))
			for i, v := range updatedVideos {
				assert.Equal(t, tt.want[i].ID, v.ID)
				assert.Equal(t, tt.want[i].Title, v.Title)
				if v.StartedAt != nil && tt.want[i].StartedAt != nil {
					assert.True(t, v.StartedAt.Equal(*tt.want[i].StartedAt), "StartedAt times are not equal")
				} else {
					assert.Nil(t, v.StartedAt)
					assert.Nil(t, tt.want[i].StartedAt)
				}
			}
		})
	}
}

func TestVideos_FilterDeletedVideos(t *testing.T) {
	tests := []struct {
		name           string
		videos         model.Videos
		comparedVideos model.Videos
		want           model.Videos
	}{
		{
			name: "one video deleted",
			videos: model.Videos{
				&model.Video{ID: "1", Title: "Video 1"},
				&model.Video{ID: "2", Title: "Video 2"},
			},
			comparedVideos: model.Videos{
				&model.Video{ID: "1", Title: "Video 1"},
			},
			want: model.Videos{
				&model.Video{ID: "2", Title: "Video 2"},
			},
		},
		{
			name: "no videos deleted",
			videos: model.Videos{
				&model.Video{ID: "1", Title: "Video 1"},
			},
			comparedVideos: model.Videos{
				&model.Video{ID: "1", Title: "Video 1"},
			},
			want: model.Videos{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			deletedVideos := tt.videos.FilterDeletedVideos(tt.comparedVideos)
			assert.Equal(t, len(tt.want), len(deletedVideos))
			for i, v := range deletedVideos {
				assert.Equal(t, tt.want[i].ID, v.ID)
				assert.Equal(t, tt.want[i].Title, v.Title)
			}
		})
	}
}

func TestVideos_UpdateCreatorInfo(t *testing.T) {
	tests := []struct {
		name     string
		videos   model.Videos
		creators model.Creators
		want     model.CreatorInfo
	}{
		{
			name: "youtube creator info updated",
			videos: model.Videos{
				&model.Video{
					ID: "1", Platform: model.PlatformYouTube,
					CreatorInfo: model.CreatorInfo{ChannelID: "yt123"},
				},
			},
			creators: model.Creators{
				{
					ID: "creator1", Name: "Creator Name", ThumbnailURL: "https://example.com/image.png",
					Channel: model.Channel{
						Youtube: model.ChannelSnippet{ID: "yt123"},
					},
				},
			},
			want: model.CreatorInfo{
				ID: "creator1", Name: "Creator Name", ThumbnailURL: "https://example.com/image.png",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			updatedVideos := tt.videos.UpdateCreatorInfo(tt.creators)
			assert.Equal(t, tt.want.ID, updatedVideos[0].CreatorInfo.ID)
			assert.Equal(t, tt.want.Name, updatedVideos[0].CreatorInfo.Name)
			assert.Equal(t, tt.want.ThumbnailURL, updatedVideos[0].CreatorInfo.ThumbnailURL)
		})
	}
}
