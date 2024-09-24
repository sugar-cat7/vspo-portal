package http

import (
	"context"
	"errors"

	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/environment"
	api "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/gen"
)

var _ api.SecurityHandler = (*SecurityHandler)(nil)

type SecurityHandler struct {
	e *environment.Environment
}

func NewSecurityHandler(e *environment.Environment) *SecurityHandler {
	return &SecurityHandler{
		e: e,
	}
}

func (h *SecurityHandler) HandleBearerAuth(ctx context.Context, operationName string, t api.BearerAuth) (context.Context, error) {
	if t.GetToken() != h.e.CRON_SECRET {
		return nil, errors.New("invalid api key")
	}
	return ctx, nil
}
