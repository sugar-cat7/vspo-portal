package model

// Platform represents a live platform.
type Platform string

const (
	PlatformYouTube     Platform = "youtube"
	PlatformTwitch      Platform = "twitch"
	PlatformTwitCasting Platform = "twitcasting"
	PlatformNiconico    Platform = "niconico"
	PlatformUnknown     Platform = "unknown"
)

func NewPlatform(
	platform string,
) Platform {
	switch platform {
	case PlatformYouTube.String():
		return PlatformYouTube
	case PlatformTwitch.String():
		return PlatformTwitch
	case PlatformTwitCasting.String():
		return PlatformTwitCasting
	case PlatformNiconico.String():
		return PlatformNiconico
	default:
		return PlatformUnknown
	}
}

func (p Platform) String() string {
	return string(p)
}
