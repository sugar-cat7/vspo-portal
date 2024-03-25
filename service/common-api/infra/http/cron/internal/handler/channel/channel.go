package channel

import (
	"context"
	"fmt"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
)

// ChannelsPost is ...
func (h *CH) ChannelsPost(ctx context.Context, req *api.ChannelsPostReq) (api.ChannelsPostRes, error) {
	cs, err := h.channelInteractor.UpsertAll(
		ctx,
		input.NewUpsertAllChannelInput(
			string(req.PlatformType.Value),
			string(req.Period.Value),
			string(req.ChannelType.Value),
		))
	if err != nil {
		return nil, err
	}
	return &api.ChannelsPostOK{
		Message: api.OptString{
			Value: fmt.Sprintf("Updated videos: %d", len(cs)),
		},
	}, nil
}
