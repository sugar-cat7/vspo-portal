package ping

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/gen"
)

// APIPingGet handles the request.
func (p *P) APIPingGet(ctx context.Context) (*api.APIPingGetOK, error) {
	return &api.APIPingGetOK{
		Message: api.OptString{
			Value: "success",
			Set:   true,
		},
	}, nil
}
