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

	logger.Info("[START] server.")
	// Cron
	cs, err := cron.NewServer(
		cron_handler.NewHandler(
			d.ChannelInteractor,
			d.VideosInteractor,
		),
		cron_handler.NewSecurityHandler(),
	)
	if err != nil {
		panic(err)
	}
	// API
	hs, err := api.NewServer(
		http_handler.NewHandler(
			d.CreatorInteractor,
			d.VideosInteractor),
		http_handler.NewSecurityHandler(),
	)
	if err != nil {
		panic(err)
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
