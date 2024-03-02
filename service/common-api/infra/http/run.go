package http

import (
	"context"
	"net/http"
	"strings"

	"github.com/caarlos0/env/v9"
	"github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
	cron "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/dependency"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/environment"
	cron_handler "github.com/sugar-cat7/vspo-portal/service/common-api/infra/http/cron"
	http_handler "github.com/sugar-cat7/vspo-portal/service/common-api/infra/http/server"
	"github.com/sugar-cat7/vspo-portal/service/common-api/pkg/logger"
	"go.uber.org/zap"
)

func Run(w http.ResponseWriter, r *http.Request) {
	e := &environment.Environment{}
	if err := env.Parse(e); err != nil {
		panic(err)
	}

	logger := logger.New()

	ctx := context.Background()

	d := &dependency.Dependency{}
	d.Inject(ctx, e)

	logger.Info("[START] server.")
	// Cron
	cs, err := cron.NewServer(
		&cron_handler.RootHandler{},
		&cron_handler.SecurityHandler{},
	)
	if err != nil {
		panic(err)
	}
	// API
	hs, err := api.NewServer(
		&http_handler.RootHandler{},
		&http_handler.SecurityHandler{},
	)
	if err != nil {
		panic(err)
	}

	if e.ServerEnvironment.ENV == "local" {
		// In a local environment, listen on different ports
		go func() {
			logger.Info("Starting cron server on :8081")
			if err := http.ListenAndServe(":8081", cs); err != nil {
				logger.Error("Cron server failed to start", zap.Error(err))
			}
		}()

		logger.Info("Starting API server on :8080")
		if err := http.ListenAndServe(":8080", hs); err != nil {
			logger.Error("API server failed to start", zap.Error(err))
		}
		return
	}

	// In a production environment, listen on the same port
	pathSegments := strings.Split(r.URL.Path, "/")

	if len(pathSegments) <= 1 || pathSegments[1] != "api" {
		http.NotFound(w, r)
		return
	}

	if len(pathSegments) > 2 && pathSegments[2] == "cron" {
		cs.ServeHTTP(w, r)
		return
	}
	r.URL.Path = "/" + strings.Join(pathSegments[2:], "/")
	hs.ServeHTTP(w, r)
}
