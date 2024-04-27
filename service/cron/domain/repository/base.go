package repository

import "github.com/volatiletech/null/v8"

type BaseGetOptions struct {
	OrFail    bool
	Preload   bool
	ForUpdate bool
}

type BaseListOptions struct {
	Page      null.Uint64
	Limit     null.Uint64
	Preload   bool
	ForUpdate bool
}
