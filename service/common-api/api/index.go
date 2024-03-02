package api

import (
	"net/http"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
	handler "github.com/sugar-cat7/vspo-portal/service/common-api/infra/http/server"
)

// Handler is the entry point for the serverless function
func Handler(w http.ResponseWriter, r *http.Request) {
	s, err := api.NewServer(handler.NewRootHandler(), handler.NewSecurityHandler())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	// prefix /api remove
	r.URL.Path = r.URL.Path[4:]
	s.ServeHTTP(w, r)
}
