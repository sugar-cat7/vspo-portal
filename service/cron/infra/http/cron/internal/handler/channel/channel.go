package channel

import (
	"context"
	"fmt"

	api "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
)

// ChannelsPost is ...
func (h *CH) ChannelsPost(ctx context.Context, req *api.ChannelsPostReq) (api.ChannelsPostRes, error) {
	err := h.channelInteractor.BatchUpdate(
		ctx,
		input.NewUpsertChannelInput(
			string(req.PlatformType.Value),
			string(req.Period.Value),
			string(req.ChannelType.Value),
		))
	if err != nil {
		return nil, err
	}
	return &api.ChannelsPostOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated videos"),
		},
	}, nil
}
