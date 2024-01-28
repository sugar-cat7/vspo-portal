package model

type Creator struct {
	ID       string
	Name     string
	Channels Channels
}

type Creators []*Creator
