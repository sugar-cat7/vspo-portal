package creator

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"
)

// APICronCreatorsGet is ...
func (h *CR) APICronCreatorsGet(ctx context.Context, req api.APICronCreatorsGetParams) (api.APICronCreatorsGetRes, error) {
	return nil, nil
	// err := h.creatorInteractor.BatchUpdate(
	// 	ctx,
	// 	input.NewUpsertCreatorInput(
	// 		string(req.PlatformType.Value),
	// 		string(req.Period.Value),
	// 		string(req.CreatorType.Value),
	// 	))
	// if err != nil {
	// 	return nil, err
	// }
	// return &api.APICronCreatorsGetOK{
	// 	Message: api.OptString{
	// 		Value: fmt.Sprintf("Updated videos"),
	// 	},
	// }, nil
}
