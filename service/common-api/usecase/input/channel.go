package input

// UpsertAllChannels is the input for UpsertAllChannel
type UpsertAllChannels struct {
	ChannelType  string
	PlatformType string
	Period       string
}

// NewUpsertAllChannelInput returns a new UpsertAllChannelInput
func NewUpsertAllChannelInput(
	channelType string,
	platformType string,
	period string,
) *UpsertAllChannels {
	return &UpsertAllChannels{
		ChannelType:  channelType,
		PlatformType: platformType,
		Period:       period,
	}
}
