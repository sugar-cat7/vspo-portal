package handler

import (
	"net/http"

	http_func "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	http_func.Run(w, r)
}
