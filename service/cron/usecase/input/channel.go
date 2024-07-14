package input

// BatchUpdateChannels is the input for BatchUpdateChannel
type BatchUpdateChannels struct {
	PlatformType string
}

// NewBatchUpdateChannelInput returns a new BatchUpdateChannelInput
func NewBatchUpdateChannelInput(
	platformType string,
) *BatchUpdateChannels {
	return &BatchUpdateChannels{
		PlatformType: platformType,
	}
}
