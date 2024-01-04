package main

import (
	"net/http"

	"github.com/go-openapi/runtime/middleware"
)

// Handler SwaggerUI
func Handler(w http.ResponseWriter, r *http.Request) {
	swaggerJSONURL := "https://raw.githubusercontent.com/sugar-cat7/vspo-portal/main/service/common-api/docs/swagger.json"

	opts := middleware.SwaggerUIOpts{
		SpecURL: swaggerJSONURL,
		Path:    "/api/swagger",
	}

	middleware.SwaggerUI(opts, nil).ServeHTTP(w, r)
}
