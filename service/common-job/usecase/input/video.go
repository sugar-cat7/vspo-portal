package input

// UpsertVideos is the input for UpsertVideo
type UpsertVideos struct {
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
) *UpsertVideos {
	return &UpsertVideos{
		PlatformTypes: platformTypes,
		Period:        period,
		VideoType:     videoType,
	}
}
