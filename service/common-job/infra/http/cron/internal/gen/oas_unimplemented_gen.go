// Code generated by ogen, DO NOT EDIT.

package api

import (
	"context"

	ht "github.com/ogen-go/ogen/http"
)

// UnimplementedHandler is no-op Handler which returns http.ErrNotImplemented.
type UnimplementedHandler struct{}

var _ Handler = UnimplementedHandler{}

// APICronChannelsGet implements GET /api/cron/channels operation.
//
// Update channels.
//
// GET /api/cron/channels
func (UnimplementedHandler) APICronChannelsGet(ctx context.Context, params APICronChannelsGetParams) (r APICronChannelsGetRes, _ error) {
	return r, ht.ErrNotImplemented
}

// APICronCreatorsGet implements GET /api/cron/creators operation.
//
// Creates creators by fetching from Youtube using provided Channel IDs.
//
// GET /api/cron/creators
func (UnimplementedHandler) APICronCreatorsGet(ctx context.Context, params APICronCreatorsGetParams) (r APICronCreatorsGetRes, _ error) {
	return r, ht.ErrNotImplemented
}

// APICronExistVideosGet implements GET /api/cron/exist_videos operation.
//
// Update exist videos.
//
// GET /api/cron/exist_videos
func (UnimplementedHandler) APICronExistVideosGet(ctx context.Context, params APICronExistVideosGetParams) (r APICronExistVideosGetRes, _ error) {
	return r, ht.ErrNotImplemented
}

// APICronSearchVideosGet implements GET /api/cron/search_videos operation.
//
// Update videos related to a specific creator based on provided.
//
// GET /api/cron/search_videos
func (UnimplementedHandler) APICronSearchVideosGet(ctx context.Context, params APICronSearchVideosGetParams) (r APICronSearchVideosGetRes, _ error) {
	return r, ht.ErrNotImplemented
}

// APIPingGet implements GET /api/ping operation.
//
// Returns a 200 status code if successful, or an error.
//
// GET /api/ping
func (UnimplementedHandler) APIPingGet(ctx context.Context) (r *APIPingGetOK, _ error) {
	return r, ht.ErrNotImplemented
}

// ExistVideos implements exist_videos operation.
//
// Update exist videos based on the provided period.
//
// POST /exist_videos
func (UnimplementedHandler) ExistVideos(ctx context.Context, req *ExistVideosReq) (r ExistVideosRes, _ error) {
	return r, ht.ErrNotImplemented
}

// Ping implements ping operation.
//
// Returns a 200 status code if successful, or an error.
//
// POST /ping
func (UnimplementedHandler) Ping(ctx context.Context) (r *PingOK, _ error) {
	return r, ht.ErrNotImplemented
}

// SearchVideos implements search_videos operation.
//
// Update videos related to a specific creator based on provided.
//
// POST /search_videos
func (UnimplementedHandler) SearchVideos(ctx context.Context, req *SearchVideosReq) (r SearchVideosRes, _ error) {
	return r, ht.ErrNotImplemented
}
