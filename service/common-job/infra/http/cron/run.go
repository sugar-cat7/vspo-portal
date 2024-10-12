package http

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/caarlos0/env/v10"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/dependency"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/environment"
	cron "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/gen"
	"github.com/sugar-cat7/vspo-portal/service/common-job/pkg/logger"
	app_trace "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/otel"
	"go.opentelemetry.io/otel"
)

type OtelKey string

const (
	OTelTracer = OtelKey("tracer")
)

// Run starts the server.
func Run(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	e := &environment.Environment{}
	if err := env.Parse(e); err != nil {
		panic(err)
	}
	logger := logger.New()

	traceProvider := app_trace.SetTracerProvider("vspo-cron", e.ServerEnvironment.ENV)
	defer traceProvider.Shutdown()
	otel.SetTracerProvider(traceProvider)
	d := &dependency.Dependency{}
	d.Inject(ctx, e)
	logger.Info(fmt.Sprintf("%s %s", r.Method, r.URL.Path))
	// Cron
	cs, err := cron.NewServer(
		NewHandler(
			d.CreatorInteractor,
			d.VideosInteractor,
			d.ChannelInteractor,
		),
		NewSecurityHandler(e),
		cron.WithMiddleware(),
		cron.WithTracerProvider(traceProvider),
	)

	if err != nil {
		http.Error(w, fmt.Sprintf("failed to create cron server: %v", err), http.StatusInternalServerError)
		return
	}
	cs.ServeHTTP(w, r)
}

// StartServer for Debug
func StartServer() {
	logger := logger.New()
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		Run(w, r)
	})

	server := &http.Server{
		Addr:    ":8080",
		Handler: nil,
	}

	// Graceful shutdown
	idleConnsClosed := make(chan struct{})
	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt, syscall.SIGTERM)
		<-sigint

		// Received an interrupt signal, shut down gracefully
		if err := server.Shutdown(context.Background()); err != nil {
			logger.Error(fmt.Sprintf("HTTP server Shutdown: %v", err))
		}
		close(idleConnsClosed)
	}()

	logger.Info("Starting server on :8080")
	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		// Error starting or closing listener
		logger.Error(fmt.Sprintf("HTTP server ListenAndServe: %v", err))
	}

	<-idleConnsClosed
	logger.Info("Server gracefully stopped")
}
