// Code generated by ogen, DO NOT EDIT.

package api

import (
	"context"

	ht "github.com/ogen-go/ogen/http"
)

// UnimplementedHandler is no-op Handler which returns http.ErrNotImplemented.
type UnimplementedHandler struct{}

var _ Handler = UnimplementedHandler{}

// ChannelsChannelIDVideosPost implements POST /channels/{channel_id}/videos operation.
//
// Update videos related to a specific channel based on provided cronType.
//
// POST /channels/{channel_id}/videos
func (UnimplementedHandler) ChannelsChannelIDVideosPost(ctx context.Context, req *ChannelsChannelIDVideosPostReq, params ChannelsChannelIDVideosPostParams) (r ChannelsChannelIDVideosPostRes, _ error) {
	return r, ht.ErrNotImplemented
}

// ChannelsChannelIDVideosPut implements PUT /channels/{channel_id}/videos operation.
//
// Update videos related to a specific channel based on provided cronType.
//
// PUT /channels/{channel_id}/videos
func (UnimplementedHandler) ChannelsChannelIDVideosPut(ctx context.Context, req *ChannelsChannelIDVideosPutReq, params ChannelsChannelIDVideosPutParams) (r ChannelsChannelIDVideosPutRes, _ error) {
	return r, ht.ErrNotImplemented
}

// ChannelsPost implements POST /channels operation.
//
// Creates channels by fetching from Youtube using provided Channel IDs.
//
// POST /channels
func (UnimplementedHandler) ChannelsPost(ctx context.Context, req *ChannelsPostReq) (r ChannelsPostRes, _ error) {
	return r, ht.ErrNotImplemented
}

// ChannelsPut implements PUT /channels operation.
//
// Updates channels by fetching from Youtube using provided Channel IDs.
//
// PUT /channels
func (UnimplementedHandler) ChannelsPut(ctx context.Context, req *ChannelsPutReq) (r ChannelsPutRes, _ error) {
	return r, ht.ErrNotImplemented
}
