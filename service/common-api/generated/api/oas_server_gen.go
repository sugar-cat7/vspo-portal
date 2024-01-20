// Code generated by ogen, DO NOT EDIT.

package api

import (
	"context"
)

// Handler handles operations described by OpenAPI v3 specification.
type Handler interface {
	// ChannelsChannelIDVideosGet implements GET /channels/{channel_id}/videos operation.
	//
	// Retrieve all videos related to a specific channel.
	//
	// GET /channels/{channel_id}/videos
	ChannelsChannelIDVideosGet(ctx context.Context, params ChannelsChannelIDVideosGetParams) (ChannelsChannelIDVideosGetRes, error)
	// ChannelsChannelIDVideosPost implements POST /channels/{channel_id}/videos operation.
	//
	// Update videos related to a specific channel based on provided cronType.
	//
	// POST /channels/{channel_id}/videos
	ChannelsChannelIDVideosPost(ctx context.Context, req *ChannelsChannelIDVideosPostReq, params ChannelsChannelIDVideosPostParams) (ChannelsChannelIDVideosPostRes, error)
	// ChannelsChannelIDVideosPut implements PUT /channels/{channel_id}/videos operation.
	//
	// Update videos related to a specific channel based on provided cronType.
	//
	// PUT /channels/{channel_id}/videos
	ChannelsChannelIDVideosPut(ctx context.Context, req *ChannelsChannelIDVideosPutReq, params ChannelsChannelIDVideosPutParams) (ChannelsChannelIDVideosPutRes, error)
	// ChannelsGet implements GET /channels operation.
	//
	// Retrieves all channels based on provided IDs.
	//
	// GET /channels
	ChannelsGet(ctx context.Context, params ChannelsGetParams) (ChannelsGetRes, error)
	// ChannelsPost implements POST /channels operation.
	//
	// Creates channels by fetching from Youtube using provided Channel IDs.
	//
	// POST /channels
	ChannelsPost(ctx context.Context, req *ChannelsPostReq) (ChannelsPostRes, error)
	// ChannelsPut implements PUT /channels operation.
	//
	// Updates channels by fetching from Youtube using provided Channel IDs.
	//
	// PUT /channels
	ChannelsPut(ctx context.Context, req *ChannelsPutReq) (ChannelsPutRes, error)
}

// Server implements http server based on OpenAPI v3 specification and
// calls Handler to handle requests.
type Server struct {
	h   Handler
	sec SecurityHandler
	baseServer
}

// NewServer creates new Server.
func NewServer(h Handler, sec SecurityHandler, opts ...ServerOption) (*Server, error) {
	s, err := newServerConfig(opts...).baseServer()
	if err != nil {
		return nil, err
	}
	return &Server{
		h:          h,
		sec:        sec,
		baseServer: s,
	}, nil
}