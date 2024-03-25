package http

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
)

var _ api.SecurityHandler = (*SecurityHandler)(nil)

type SecurityHandler struct{}

func NewSecurityHandler() *SecurityHandler {
	return &SecurityHandler{}
}

func (h *SecurityHandler) HandleApiKeyAuth(ctx context.Context, operationName string, t api.ApiKeyAuth) (context.Context, error) {
	// FIXME: implement
	return ctx, nil
}

func (h *SecurityHandler) HandleYoutubeApiKey(ctx context.Context, operationName string, t api.YoutubeApiKey) (context.Context, error) {
	// FIXME: implement
	return ctx, nil
}
