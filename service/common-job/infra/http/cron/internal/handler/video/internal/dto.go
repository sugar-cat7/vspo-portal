package dto

import (
	api "github.com/sugar-cat7/vspo-portal/service/common-job/infra/http/cron/internal/gen"
)

func ConvertPlatFormTypeOgenToReq(p api.APICronSearchVideosGetPlatformTypeItem) string {
	return string(p)
}

func ConvertPlatFormTypeOgenToReqSlice(p []api.APICronSearchVideosGetPlatformTypeItem) []string {
	var result []string
	for _, v := range p {
		result = append(result, string(v))
	}
	return result
}

func ConvertPostPlatFormTypeOgenToReqSlice(p []api.SearchVideosReqPlatformTypeItem) []string {
	var result []string
	for _, v := range p {
		result = append(result, string(v))
	}
	return result
}
