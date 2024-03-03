package model

import "fmt"

// Creator represents a content creator.
type Creator struct {
	ID           string
	Name         string
	ThumbnailURL ThumbnailURL
	Channel      Channel
}

// Creators is a slice of pointers to Creator.
type Creators []*Creator

// RetrieveChannels is ...
func (cs Creators) RetrieveChannels() Channels {
	channels := make(Channels, len(cs))
	for i, c := range cs {
		channels[i] = &c.Channel
	}
	return channels
}

type MemberType string

const (
	MemberTypeVspoJP  MemberType = "vspo_jp"
	MemberTypeVspoEN  MemberType = "vspo_en"
	MemberTypeGeneral MemberType = "general"
)

// NewMemberType creates a new MemberType.
func NewMemberType(s string) (MemberType, error) {
	switch s {
	case "vspo_jp", "vspo_en", "general":
		return MemberType(s), nil
	default:
		return "", fmt.Errorf("invalid MemberType: %s", s)
	}
}

// VideoTypeToMemberTypes represents the type of video.
func VideoTypeToMemberTypes(vt VideoType) []string {
	switch vt {
	case VideoTypeVspoBroadcast, VideoTypeFreechat:
		return []string{MemberTypeVspoJP.String(), MemberTypeVspoEN.String()}
	case VideoTypeClip:
		return []string{MemberTypeGeneral.String()}
	default:
		return []string{MemberTypeVspoJP.String(), MemberTypeVspoEN.String(), MemberTypeGeneral.String()}
	}
}

func (t MemberType) String() string {
	return string(t)
}
