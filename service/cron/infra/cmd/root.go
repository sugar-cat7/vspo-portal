package cmd

import (
	"github.com/spf13/cobra"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/cmd/internal/cron_cmd"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/cmd/internal/db_migration_cmd"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/cmd/internal/http_cmd"
	"github.com/sugar-cat7/vspo-portal/service/cron/pkg/logger"
)

// NewCmdRoot is a function to create root command
func NewCmdRoot() *cobra.Command {
	rootCmd := &cobra.Command{
		Use:   "app",
		Short: "cli tool for vspo-portal app",
		Long:  "cli tool for vspo-portal app",
	}
	rootCmd.AddCommand(http_cmd.NewHttpServeCmd())
	rootCmd.AddCommand(cron_cmd.NewCronCmd())
	rootCmd.AddCommand(db_migration_cmd.NewDBMigrationCmd())
	rootCmd.AddCommand(&cobra.Command{
		Use:   "ping",
		Short: "ping",
		Run: func(cmd *cobra.Command, args []string) {
			logger := logger.New()
			logger.Info("pong")
		},
	})
	return rootCmd
}
