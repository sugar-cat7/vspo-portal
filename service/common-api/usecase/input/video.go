package input

// UpsertAllVideo is the input for UpsertAllVideo
type UpsertAllVideos struct {
	PlatformType string
	Period       string
	VideoType    string
}

// NewUpsertAllVideoInput returns a new UpsertAllVideoInput
func NewUpsertAllVideoInput(
	platformType string,
	period string,
	videoType string,
) *UpsertAllVideos {
	return &UpsertAllVideos{
		PlatformType: platformType,
		Period:       period,
		VideoType:    videoType,
	}
}
