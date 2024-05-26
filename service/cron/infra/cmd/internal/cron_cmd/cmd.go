package cron_cmd

import (
	"github.com/spf13/cobra"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/cmd/internal/cron_cmd/channel_cmd"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/cmd/internal/cron_cmd/video_cmd"
)

// NewCronCmd is a function to create cron command
func NewCronCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "cron",
		Short: "cli cron",
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) == 0 {
				cmd.HelpFunc()(cmd, args)
			}
		},
	}
	cmd.AddCommand(video_cmd.NewVideoCmd())
	cmd.AddCommand(channel_cmd.NewChannelCmd())
	return cmd
}
