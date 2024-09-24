package http_cmd

import (
	"github.com/caarlos0/env/v10"
	"github.com/spf13/cobra"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/environment"
	http_serve "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron"
)

func NewHttpServeCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "http-serve",
		Short: "cli http serve",
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) == 0 {
				cmd.HelpFunc()(cmd, args)
			}
			e := &environment.Environment{}
			if err := env.Parse(e); err != nil {
				panic(err)
			}
			http_serve.StartServer()
		},
	}
	return cmd
}
