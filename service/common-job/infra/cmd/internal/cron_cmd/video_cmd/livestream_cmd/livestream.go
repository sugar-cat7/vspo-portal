package livestream_cmd

import (
	"context"

	"github.com/spf13/cobra"
	"github.com/sugar-cat7/vspo-portal/service/common-job/pkg/logger"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
)

type CMD struct {
	ctx             context.Context
	videoInteractor usecase.VideoInteractor
}

func (c *CMD) UpdatePlatformVideosRun(cmd *cobra.Command) error {
	v, err := c.videoInteractor.UpdatePlatformVideos(
		c.ctx,
		input.NewUpsertVideoInput(
			[]string{"youtube", "twitch", "twitcasting"},
			"vspo_stream",
		),
	)
	l := logger.New()
	if err != nil {
		l.Error(err.Error())
		return err
	}

	l.Info("Updated videos Count: %v", v)
	return nil
}

func (c *CMD) UpdatwExistVideosRun(cmd *cobra.Command) error {
	v, err := c.videoInteractor.UpdatwExistVideos(
		c.ctx,
		input.NewUpdateExistVideos(
			"week",
		),
	)
	l := logger.New()
	if err != nil {
		l.Error(err.Error())
		return err
	}

	l.Info("Updated videos Count: %v", v)
	return nil
}
