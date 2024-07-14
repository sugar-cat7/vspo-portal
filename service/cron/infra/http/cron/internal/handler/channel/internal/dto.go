package dto

import (
	api "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"
)

func ConvertPlatFormTypeOgenToReq(p api.APICronChannelsGetPlatformType) string {
	return string(p)
}
