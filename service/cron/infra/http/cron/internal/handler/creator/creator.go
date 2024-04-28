package creator

import (
	"context"

	api "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"
)

// CronCreatorsPost is ...
func (h *CH) CronCreatorsPost(ctx context.Context, req *api.CronCreatorsPostReq) (api.CronCreatorsPostRes, error) {
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
	// return &api.CronCreatorsPostOK{
	// 	Message: api.OptString{
	// 		Value: fmt.Sprintf("Updated videos"),
	// 	},
	// }, nil
}
