package ping

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"
)

// PingGet is ...
func (p *P) PingGet(ctx context.Context) (*api.PingGetOK, error) {
	return &api.PingGetOK{
		Message: api.OptString{
			Value: "success",
			Set:   true,
		},
	}, nil
}
