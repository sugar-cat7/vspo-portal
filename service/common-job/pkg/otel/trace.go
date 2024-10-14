package trace

import (
	oteltrace "go.opentelemetry.io/otel/trace"
	ddotel "gopkg.in/DataDog/dd-trace-go.v1/ddtrace/opentelemetry"
	ddtrace "gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

var tracer oteltrace.Tracer

// SetTracerProvider
func SetTracerProvider(serviceName, env string) *ddotel.TracerProvider {
	traceProvider := ddotel.NewTracerProvider(
		ddtrace.WithService(serviceName),
		ddtrace.WithEnv(env),
		ddtrace.WithAgentAddr("localhost:8126"),
	)
	tracer = traceProvider.Tracer(serviceName)

	return traceProvider
}

func GetGlobalTracer() oteltrace.Tracer {
	if tracer == nil {
		panic("tracer is not initialized")
	}
	return tracer
}
