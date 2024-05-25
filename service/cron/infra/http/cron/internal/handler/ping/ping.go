package ping

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"
)

// Post handles the request.
func (p *P) Post(ctx context.Context) (*api.PostOK, error) {
	return &api.PostOK{
		Message: api.OptString{
			Value: "success",
			Set:   true,
		},
	}, nil
}
