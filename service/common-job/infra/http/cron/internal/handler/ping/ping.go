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

// PingPost handles the request.
func (p *P) PingPost(ctx context.Context) (*api.PingPostOK, error) {
	tracer := trace.GetGlobalTracer()

	_, span := tracer.Start(ctx, "Handler#PingPost")
	defer span.End()
	span.AddEvent("PingPost")

	return &api.PingPostOK{
		Message: api.OptString{
			Value: "success",
			Set:   true,
		},
	}, nil
}
