package channel

import (
	"context"
	"fmt"

	api "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/gen"
	dto "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/handler/channel/internal"
	"github.com/sugar-cat7/vspo-portal/service/common-job/pkg/logger"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
)

// APICronChannelsGet implements the POST /channels/{channel_id}/channels endpoint.
func (h *CH) APICronChannelsGet(ctx context.Context, req api.APICronChannelsGetParams) (api.APICronChannelsGetRes, error) {
	v, err := h.channelInteractor.BatchUpdate(
		ctx,
		input.NewBatchUpdateChannelInput(
			dto.ConvertPlatFormTypeOgenToReq(req.PlatformType),
		),
	)

	if err != nil {
		logger.New().Error(err.Error())
		return nil, err
	}
	return &api.APICronChannelsGetOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated channels Count: %v", len(v)),
			Set:   true,
		},
	}, nil
}
