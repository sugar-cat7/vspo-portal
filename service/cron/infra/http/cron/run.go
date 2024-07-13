package http

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/caarlos0/env/v10"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/dependency"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/environment"
	cron "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"

	"github.com/sugar-cat7/vspo-portal/service/cron/pkg/logger"
)

// Run starts the server.
func Run(w http.ResponseWriter, r *http.Request) {
	e := &environment.Environment{}
	if err := env.Parse(e); err != nil {
		panic(err)
	}
	logger := logger.New()

	ctx := context.Background()
	d := &dependency.Dependency{}
	d.Inject(ctx, e)
	logger.Info(fmt.Sprintf("%s %s", r.Method, r.URL.Path))
	// Cron
	cs, err := cron.NewServer(
		NewHandler(
			d.CreatorInteractor,
			d.VideosInteractor,
		),
		NewSecurityHandler(e),
		cron.WithMiddleware(),
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
		Addr:    ":8080", // Change the port number as needed
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
