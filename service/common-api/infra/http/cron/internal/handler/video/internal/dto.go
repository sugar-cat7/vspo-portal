package dto

import (
	api "github.com/sugar-cat7/vspo-portal/service/common-api/generated/cron"
)

func ConvertPlatFormTypeOgenToReq(p api.VideosPostReqPlatformTypeItem) string {
	return string(p)
}

func ConvertPlatFormTypeOgenToReqSlice(p []api.VideosPostReqPlatformTypeItem) []string {
	var result []string
	for _, v := range p {
		result = append(result, string(v))
	}
	return result
}
