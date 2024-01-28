package creator

import (
	"context"
	"strings"

	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/api"
	dto "github.com/sugar-cat7/vspo-portal/service/common-api/infra/http/internal/handler/creator/internal"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
)

// CreatorsGet implements the GET /creators endpoint.
func (h *CH) CreatorsGet(ctx context.Context, params api.CreatorsGetParams) (api.CreatorsGetRes, error) {
	ids := strings.Split(params.Ids.Value, ",")

	c, err := h.creatorInteractor.List(ctx, input.NewListCreators(
		ids,
		uint64(params.Page.Value),
		uint64(params.Limit.Value),
	))
	if err != nil {
		return nil, err
	}
	return &api.CreatorsResponse{
		Creators:   dto.CreatorsResponse(c.Creators),
		Pagination: dto.PaginationResponse(c.Pagination),
	}, nil
}
