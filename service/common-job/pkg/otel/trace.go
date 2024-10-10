package trace

import (
	"context"
	"fmt"

	oteltrace "go.opentelemetry.io/otel/trace"
	ddotel "gopkg.in/DataDog/dd-trace-go.v1/ddtrace/opentelemetry"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

type OtelKey string

const (
	OTelTracer = OtelKey("tracer")
)

func SetTracerInContext(ctx context.Context, serviceName, env string) (context.Context, *ddotel.TracerProvider) {
	traceProvider := ddotel.NewTracerProvider(
		tracer.WithService(serviceName),
		tracer.WithEnv(env),
	)

	ctx = context.WithValue(ctx, OTelTracer, traceProvider.Tracer(serviceName))

	return ctx, traceProvider
}

func GetTracerFromContext(ctx context.Context) (oteltrace.Tracer, error) {
	tracer, ok := ctx.Value(OTelTracer).(oteltrace.Tracer)
	if !ok {
		return nil, fmt.Errorf("tracer not found in context")
	}
	return tracer, nil
}
