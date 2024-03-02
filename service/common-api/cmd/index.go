package main

import (
	"net/http"

	http_handler "github.com/sugar-cat7/vspo-portal/service/common-api/infra/http"
)

// debug
func main() {
	http.HandleFunc("/", http_handler.Run)
}
