package input

// UpsertAllVideos is the input for UpsertAllVideo
type UpsertAllVideos struct {
	VideoIDs      []string
	PlatformTypes []string
	VideoType     string
	Period        string
}

// NewUpsertAllVideoInput returns a new UpsertAllVideoInput
func NewUpsertAllVideoInput(
	platformTypes []string,
	videoType string,
	period string,
) *UpsertAllVideos {
	return &UpsertAllVideos{
		PlatformTypes: platformTypes,
		Period:        period,
		VideoType:     videoType,
	}
}
