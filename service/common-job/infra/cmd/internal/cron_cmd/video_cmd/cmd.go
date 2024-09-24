package video_cmd

import (
	"github.com/spf13/cobra"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/cmd/internal/cron_cmd/video_cmd/clip_cmd"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/cmd/internal/cron_cmd/video_cmd/livestream_cmd"
)

// NewVideoCmd is a function to create video command
func NewVideoCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "fetch-video",
		Short: "fetch video",
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) == 0 {
				cmd.HelpFunc()(cmd, args)
			}
		},
	}
	cmd.AddCommand(livestream_cmd.NewVideoCmd())
	cmd.AddCommand(clip_cmd.NewVideoCmd())
	return cmd
}
