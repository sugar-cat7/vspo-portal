package http

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
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
