package main

import (
	"github.com/caarlos0/env/v10"
	migration "github.com/sugar-cat7/vspo-portal/service/cron/infra/database/schema"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/environment"
)

func main() {
	e := &environment.Environment{}
	if err := env.Parse(e); err != nil {
		panic(err)
	}
	migration.RunUp(
		e.DBHost,
		e.DBUser,
		e.DBPassword,
		e.DBDatabase,
		e.DBSSLMode,
	)
}
