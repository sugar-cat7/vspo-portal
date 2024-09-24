package dto

import (
	api "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/gen"
)

func ConvertPlatFormTypeOgenToReq(p api.APICronChannelsGetPlatformType) string {
	return string(p)
}
