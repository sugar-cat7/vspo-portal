package model

// Thumbnail represents a Video/Icon thumbnail.
type Thumbnail struct {
	URL    string
	Width  int
	Height int
}

// Thumbnails represents a Video/Icon thumbnails.
type Thumbnails struct {
	Default Thumbnail
	Medium  Thumbnail
	High    Thumbnail
}
