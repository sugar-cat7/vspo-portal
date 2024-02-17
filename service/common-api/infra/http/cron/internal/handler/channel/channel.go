package creator

import (
	"context"
	"strings"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
)

// ChannelsGet implements the GET /creators endpoint.
func (h *CH) ChannelsGet(ctx context.Context, params api.ChannelsGetParams) (api.ChannelsGetRes, error) {
	ids := strings.Split(params.ChannelIds.Value, ",")

	c, err := h.creatorInteractor.List(ctx, input.NewListChannels(
		ids,
		string(params.ChannelType.Value),
		uint64(params.Page.Value),
		uint64(params.Limit.Value),
	))
	if err != nil {
		return nil, err
	}
	return &api.ChannelsResponse{
		Channels:   dto.ChannelsResponse(c.Channels),
		Pagination: dto.PaginationResponse(c.Pagination),
	}, nil
}
