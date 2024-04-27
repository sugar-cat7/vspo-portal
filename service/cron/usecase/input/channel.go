package input

// UpsertChannels is the input for UpsertChannel
type UpsertChannels struct {
	ChannelType  string
	PlatformType string
	Period       string
}

// NewUpsertChannelInput returns a new UpsertChannelInput
func NewUpsertChannelInput(
	channelType string,
	platformType string,
	period string,
) *UpsertChannels {
	return &UpsertChannels{
		ChannelType:  channelType,
		PlatformType: platformType,
		Period:       period,
	}
}
