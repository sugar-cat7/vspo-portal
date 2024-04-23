package main

import (
	"log"
	"net/http"

	http_handler "github.com/sugar-cat7/vspo-portal/service/common-api/infra/http"
)

// debug
func main() {
	http.HandleFunc("/", http_handler.Run)
	port := "8080"
	log.Printf("Starting server on port %s...\n", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatalf("Error occurred while starting the server: %v", err)
	}
}
