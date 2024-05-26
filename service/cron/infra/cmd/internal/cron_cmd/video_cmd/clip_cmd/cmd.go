package clip_cmd

import (
	"github.com/spf13/cobra"
)

// NewVideoCmd is a function to create clip command
func NewVideoCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "clip",
		Short: "fetch clip",
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) == 0 {
				cmd.HelpFunc()(cmd, args)
			}
		},
	}
	return cmd
}
