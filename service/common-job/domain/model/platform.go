package model

import "fmt"

// Platform represents a live platform.
type Platform string

type Platforms []Platform

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

// NewPlatforms creates a new Platform type based on the provided string slice.
func NewPlatforms(
	platforms []string,
) (Platforms, error) {
	var res []Platform
	for _, p := range platforms {
		platform, err := NewPlatform(p)
		if err != nil {
			return nil, err
		}
		res = append(res, platform)
	}
	return res, nil
}

func (p Platform) String() string {
	return string(p)
}

func (p Platforms) String() []string {
	var res []string
	for _, platform := range p {
		res = append(res, platform.String())
	}
	return res
}
