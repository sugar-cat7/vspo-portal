package input

import (
	"time"

	utime "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/time"
)

// UpdatePlatformVideos is the input for UpsertVideo
type UpdatePlatformVideos struct {
	VideoIDs      []string
	PlatformTypes []string
	VideoType     string
}

// NewUpsertVideoInput returns a new UpsertVideoInput
func NewUpsertVideoInput(
	platformTypes []string,
	videoType string,
) *UpdatePlatformVideos {
	return &UpdatePlatformVideos{
		PlatformTypes: platformTypes,
		VideoType:     videoType,
	}
}

type UpdateExistVideos struct {
	StartedAt time.Time
	EndedAt   time.Time
}

func NewUpdateExistVideos(
	period string,
) *UpdateExistVideos {
	param := &UpdateExistVideos{}
	if period == "day" {
		param.StartedAt = utime.Utc.Now().AddDate(0, 0, -1)
	}
	if period == "week" {
		param.StartedAt = utime.Utc.Now().AddDate(0, 0, -7)
	}
	if period == "month" {
		param.StartedAt = utime.Utc.Now().AddDate(0, -1, 0)
	}
	param.EndedAt = utime.Utc.Now()
	return param
}
