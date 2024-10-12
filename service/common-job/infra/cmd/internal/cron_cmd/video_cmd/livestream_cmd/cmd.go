package livestream_cmd

import (
	"context"

	"github.com/caarlos0/env/v10"
	"github.com/spf13/cobra"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/dependency"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/environment"
	app_trace "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/otel"
	"go.opentelemetry.io/otel"
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
		},
	}
	cmd.AddCommand(
		&cobra.Command{
			Use:   "search",
			Short: "search livestream",
			Run: func(cmd *cobra.Command, args []string) {
				e := &environment.Environment{}
				if err := env.Parse(e); err != nil {
					panic(err)
				}
				ctx := context.Background()
				traceProvider := app_trace.SetTracerProvider("vspo-cron", e.ServerEnvironment.ENV)
				defer traceProvider.Shutdown()
				otel.SetTracerProvider(traceProvider)
				d := &dependency.Dependency{}
				d.Inject(ctx, e)
				c := &CMD{
					ctx,
					d.VideosInteractor,
				}
				if err := c.UpdatePlatformVideosRun(cmd); err != nil {
					panic(err)
				}
			},
		},
	)
	cmd.AddCommand(
		&cobra.Command{
			Use:   "exist",
			Short: "update exist livestream",
			Run: func(cmd *cobra.Command, args []string) {
				e := &environment.Environment{}
				if err := env.Parse(e); err != nil {
					panic(err)
				}
				ctx := context.Background()
				traceProvider := app_trace.SetTracerProvider("vspo-cron", e.ServerEnvironment.ENV)
				defer traceProvider.Shutdown()
				d := &dependency.Dependency{}
				d.Inject(ctx, e)
				c := &CMD{
					ctx,
					d.VideosInteractor,
				}
				if err := c.UpdatwExistVideosRun(cmd); err != nil {
					panic(err)
				}
			}})
	return cmd
}
