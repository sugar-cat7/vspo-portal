package channel_cmd

import (
	"github.com/spf13/cobra"
)

// NewChannelCmd is a function to create channel command
func NewChannelCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "fetch-channel",
		Short: "fetch channel",
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) == 0 {
				cmd.HelpFunc()(cmd, args)
			}
			// FIXME: Implement the logic
		},
	}
	return cmd
}
