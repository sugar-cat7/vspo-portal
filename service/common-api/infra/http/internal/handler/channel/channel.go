package channel

import (
	"context"
	"strings"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
	dto "github.com/sugar-cat7/vspo-portal/service/common-api/infra/http/internal/handler/channel/internal"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
)

// ChannelsGet implements the GET /channels endpoint.
func (h *CH) ChannelsGet(ctx context.Context, params api.ChannelsGetParams) (api.ChannelsGetRes, error) {
	ids := strings.Split(params.Ids.Value, ",")

	c, err := h.channelInteractor.List(ctx, input.NewListChannels(
		ids,
		uint64(params.Page.Value),
		uint64(params.Limit.Value),
	))
	if err != nil {
		return nil, err
	}
	return &api.ChannelsGetOK{
		Data: api.OptChannelsResponse{
			Value: dto.ChannelsResponse(c.Channels),
		},
		Pagination: api.OptPagination{},
	}, nil
}

// ChannelsPost implements the POST /channels endpoint.
func (h *CH) ChannelsPost(ctx context.Context, params *api.ChannelsPostReq) (api.ChannelsPostRes, error) {
	// FIXME: implement
	return &api.ChannelsResponse{}, nil
}

// ChannelsPut implements the PUT /channels endpoint.
func (h *CH) ChannelsPut(ctx context.Context, params *api.ChannelsPutReq) (api.ChannelsPutRes, error) {
	// FIXME: implement
	return &api.ChannelsResponse{}, nil
}
