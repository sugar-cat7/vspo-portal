package db_migration_cmd

import (
	"github.com/caarlos0/env/v10"
	"github.com/spf13/cobra"
	migration "github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/schema"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/environment"
)

func NewDBMigrationCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "db-migration",
		Short: "cli db migration",
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) == 0 {
				cmd.HelpFunc()(cmd, args)
			}
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
		},
	}
	return cmd
}
