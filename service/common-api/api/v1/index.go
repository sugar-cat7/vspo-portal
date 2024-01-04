package main

import (
	"fmt"
	"net/http"

	api "github.com/sugar-cat7/vspo-portal/generated"
	handler "github.com/sugar-cat7/vspo-portal/infra/http/server"
)

// Handler is the entry point for the serverless function
func Handler(w http.ResponseWriter, r *http.Request) {
	s, err := api.NewServer(handler.NewHandler(), nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	// prefix /api/v1 remove
	r.URL.Path = r.URL.Path[7:]
	fmt.Println(r.URL.Path)
	s.ServeHTTP(w, r)
}
