package model

// ThumbnailURL is a struct that represents the thumbnail of a video
type ThumbnailURL string

func (t ThumbnailURL) String() string {
	return string(t)
}
