package http

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/caarlos0/env/v10"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/dependency"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/environment"
	api "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"
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
			d.ChannelInteractor,
			d.VideosInteractor,
		),
		NewSecurityHandler(),
		api.WithMiddleware(),
	)
	if err != nil {
		panic(err)
	}
	pathSegments := strings.Split(r.URL.Path, "/")

	if len(pathSegments) <= 1 || pathSegments[1] != "cron" {
		http.NotFound(w, r)
		return
	}
	cs.ServeHTTP(w, r)

	// TODO: graceful shutdown
}
