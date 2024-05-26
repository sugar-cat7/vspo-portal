package livestream_cmd

import (
	"context"

	"github.com/spf13/cobra"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
)

type CMD struct {
	ctx             context.Context
	staffInteractor usecase.VideoInteractor
}

func (c *CMD) Run(cmd *cobra.Command) error {
	// FIXME: add Logger
	_, err := c.staffInteractor.BatchDeleteInsert(c.ctx, &input.UpsertVideos{})
	if err != nil {
		return err
	}
	return nil
}
