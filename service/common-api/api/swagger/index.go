package main

import (
	"net/http"

	"github.com/swaggest/swgui/v5emb"
)

// Handler is the entry point for the serverless function
func Handler(w http.ResponseWriter, r *http.Request) {
	http.Handle("/api1/docs/", v5emb.New(
		"Vspo Portal API",
		"https://petstore3.swagger.io/api/v3/openapi.json",
		"/api/docs/",
	))

	http.ListenAndServe(":3000", nil)
}
