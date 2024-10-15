package middleware

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/sugar-cat7/vspo-portal/service/common-job/pkg/logger"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/propagation"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"go.opentelemetry.io/otel/trace"
)

// Middleware is a net/http middleware.
type Middleware = func(http.Handler) http.Handler

// InjectLogger injects logger into request context.
func InjectLogger(lg *slog.Logger) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Use a custom type as the key to avoid collision
			reqCtx := context.WithValue(r.Context(), logger.LoggerKey{}, lg)
			req := r.WithContext(reqCtx)
			next.ServeHTTP(w, req)
		})
	}
}

func Labeler(find RouteFinder) Middleware {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			route, ok := find(r.Method, r.URL)
			if !ok {
				h.ServeHTTP(w, r)
				return
			}

			attr := semconv.HTTPRouteKey.String(route.PathPattern())
			span := trace.SpanFromContext(r.Context())
			span.SetAttributes(attr)

			labeler, _ := otelhttp.LabelerFromContext(r.Context())
			labeler.Add(attr)

			h.ServeHTTP(w, r)
		})
	}
}

// LogRequests logs incoming requests using context logger.
func LogRequests(find RouteFinder) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			logger := ctx.Value(logger.LoggerKey{}).(*slog.Logger)

			var (
				opName string
				opID   string
			)

			if route, ok := find(r.Method, r.URL); ok {
				opName = route.Name()
				opID = route.OperationID()
			}

			logger.Info("Got request",
				slog.String("method", r.Method),
				slog.String("url", r.URL.String()),
				slog.String("operationName", opName),
				slog.String("operationId", opID),
			)

			next.ServeHTTP(w, r)
		})
	}
}

type MetricsProvider struct {
	TracerProvider    trace.TracerProvider
	MeterProvider     metric.MeterProvider
	TextMapPropagator propagation.TextMapPropagator
}

// Instrument setups otelhttp.
func Instrument(serviceName string, find RouteFinder, m MetricsProvider) Middleware {
	return func(h http.Handler) http.Handler {
		return otelhttp.NewHandler(h, "",
			otelhttp.WithPropagators(m.TextMapPropagator),
			otelhttp.WithTracerProvider(m.TracerProvider),
			otelhttp.WithMeterProvider(m.MeterProvider),
			otelhttp.WithMessageEvents(otelhttp.ReadEvents, otelhttp.WriteEvents),
			otelhttp.WithServerName(serviceName),
			otelhttp.WithSpanNameFormatter(func(operation string, r *http.Request) string {
				op, ok := find(r.Method, r.URL)
				if ok {
					return serviceName + "#" + op.OperationID()
				}
				return operation
			}),
		)
	}
}

// Wrap handler using given middlewares.
func Wrap(h http.Handler, middlewares ...Middleware) http.Handler {
	switch len(middlewares) {
	case 0:
		return h
	case 1:
		return middlewares[0](h)
	default:
		for i := len(middlewares) - 1; i >= 0; i-- {
			h = middlewares[i](h)
		}
		return h
	}
}
