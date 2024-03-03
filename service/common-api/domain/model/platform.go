package model

import "fmt"

// Platform represents a live platform.
type Platform string

const (
	PlatformYouTube     Platform = "youtube"
	PlatformTwitch      Platform = "twitch"
	PlatformTwitCasting Platform = "twitcasting"
	PlatformNiconico    Platform = "niconico"
	PlatformUnknown     Platform = "unknown"
)

// NewPlatform creates a new Platform type based on the provided string.
func NewPlatform(
	platform string,
) (Platform, error) {
	switch platform {
	case PlatformYouTube.String():
		return PlatformYouTube, nil
	case PlatformTwitch.String():
		return PlatformTwitch, nil
	case PlatformTwitCasting.String():
		return PlatformTwitCasting, nil
	case PlatformNiconico.String():
		return PlatformNiconico, nil
	default:
		return PlatformUnknown, fmt.Errorf("invalid platform: %s", platform)
	}
}

func (p Platform) String() string {
	return string(p)
}

// NewPlatformStringTypes is ...
func NewPlatformStringTypes(s []string) ([]string, error) {
	for _, v := range s {
		if _, err := NewPlatform(v); err != nil {
			return nil, err
		}
	}
	return s, nil
}
