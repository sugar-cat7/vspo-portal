package dto

import (
	api "github.com/sugar-cat7/vspo-portal/service/cron/infra/http/cron/internal/gen"
)

func ConvertPlatFormTypeOgenToReq(p api.CronVideosPostReqPlatformTypeItem) string {
	return string(p)
}

func ConvertPlatFormTypeOgenToReqSlice(p []api.CronVideosPostReqPlatformTypeItem) []string {
	var result []string
	for _, v := range p {
		result = append(result, string(v))
	}
	return result
}
