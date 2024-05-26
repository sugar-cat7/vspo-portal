package livestream_cmd

import (
	"context"

	"github.com/caarlos0/env/v10"
	"github.com/spf13/cobra"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/dependency"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/environment"
	"github.com/sugar-cat7/vspo-portal/service/cron/pkg/logger"
)

// NewVideoCmd is a function to create video command
func NewVideoCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "livestream",
		Short: "fetch livestream",
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) == 0 {
				cmd.HelpFunc()(cmd, args)
			}
			e := &environment.Environment{}
			if err := env.Parse(e); err != nil {
				panic(err)
			}
			logger := logger.New()
			logger.Info("fetching livestream")
			ctx := context.Background()
			d := &dependency.Dependency{}
			d.Inject(ctx, e)
			c := &CMD{
				ctx,
				d.VideosInteractor,
			}
			if err := c.Run(cmd); err != nil {
				panic(err)
			}
		},
	}
	return cmd
}
