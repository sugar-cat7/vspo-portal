package input

// UpdatePlatformVideos is the input for UpsertVideo
type UpdatePlatformVideos struct {
	VideoIDs      []string
	PlatformTypes []string
	VideoType     string
	Period        string
}

// NewUpsertVideoInput returns a new UpsertVideoInput
func NewUpsertVideoInput(
	platformTypes []string,
	videoType string,
	period string,
) *UpdatePlatformVideos {
	return &UpdatePlatformVideos{
		PlatformTypes: platformTypes,
		Period:        period,
		VideoType:     videoType,
	}
}
