package ping

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/gen"
	trace "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/otel"
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

// Ping handles the request.
func (p *P) Ping(ctx context.Context) (*api.PingOK, error) {
	tracer := trace.GetGlobalTracer()

	_, span := tracer.Start(ctx, "Handler#Ping")
	defer span.End()

	return &api.PingOK{
		Message: api.OptString{
			Value: "success",
			Set:   true,
		},
	}, nil
}
