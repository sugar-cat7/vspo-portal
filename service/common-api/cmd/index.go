package main

import (
	"fmt"
	"log"
	"net/http"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
	handler "github.com/sugar-cat7/vspo-portal/service/common-api/infra/http"
)

// debug
func main() {
	s, err := api.NewServer(handler.NewRootHandler(), handler.NewSecurityHandler())
	if err != nil {
		fmt.Println(err)
		return
	}
	if err := http.ListenAndServe(":8080", s); err != nil {
		log.Fatalln(err)
	}
}
