package api

import (
	"net/http"

	http_handler "github.com/sugar-cat7/vspo-portal/service/common-api/infra/http"
)

// Handler is the entry point for the serverless function
func Handler(w http.ResponseWriter, r *http.Request) {
	http_handler.Run(w, r)
}
