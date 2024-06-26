// Code generated by ogen, DO NOT EDIT.

package api

import (
	"context"

	ht "github.com/ogen-go/ogen/http"
)

// UnimplementedHandler is no-op Handler which returns http.ErrNotImplemented.
type UnimplementedHandler struct{}

var _ Handler = UnimplementedHandler{}

// CronCreatorsPost implements POST /cron/creators operation.
//
// Creates creators by fetching from Youtube using provided Channel IDs.
//
// POST /cron/creators
func (UnimplementedHandler) CronCreatorsPost(ctx context.Context, req *CronCreatorsPostReq) (r CronCreatorsPostRes, _ error) {
	return r, ht.ErrNotImplemented
}

// CronVideosPost implements POST /cron/videos operation.
//
// Update videos related to a specific creator based on provided cronType.
//
// POST /cron/videos
func (UnimplementedHandler) CronVideosPost(ctx context.Context, req *CronVideosPostReq) (r CronVideosPostRes, _ error) {
	return r, ht.ErrNotImplemented
}

// Post implements POST / operation.
//
// Returns a 200 status code if successful, or an error.
//
// POST /
func (UnimplementedHandler) Post(ctx context.Context) (r *PostOK, _ error) {
	return r, ht.ErrNotImplemented
}
