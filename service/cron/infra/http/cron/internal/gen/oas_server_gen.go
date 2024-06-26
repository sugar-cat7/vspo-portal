// Code generated by ogen, DO NOT EDIT.

package api

import (
	"context"
)

// Handler handles operations described by OpenAPI v3 specification.
type Handler interface {
	// CronCreatorsPost implements POST /cron/creators operation.
	//
	// Creates creators by fetching from Youtube using provided Channel IDs.
	//
	// POST /cron/creators
	CronCreatorsPost(ctx context.Context, req *CronCreatorsPostReq) (CronCreatorsPostRes, error)
	// CronVideosPost implements POST /cron/videos operation.
	//
	// Update videos related to a specific creator based on provided cronType.
	//
	// POST /cron/videos
	CronVideosPost(ctx context.Context, req *CronVideosPostReq) (CronVideosPostRes, error)
	// Post implements POST / operation.
	//
	// Returns a 200 status code if successful, or an error.
	//
	// POST /
	Post(ctx context.Context) (*PostOK, error)
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
