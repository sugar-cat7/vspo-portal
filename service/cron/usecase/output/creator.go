package output

import "github.com/sugar-cat7/vspo-portal/service/cron/domain/model"

type ListCreators struct {
	Creators   model.Creators
	Pagination *model.Pagination
}

func NewListCreators(
	creators model.Creators,
	pagination *model.Pagination,
) *ListCreators {
	return &ListCreators{
		Creators:   creators,
		Pagination: pagination,
	}
}
