package output

import "github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"

type ListChannels struct {
	Channels   model.Channels
	Pagination *model.Pagination
}

func NewListChannels(
	channels model.Channels,
	pagination *model.Pagination,
) *ListChannels {
	return &ListChannels{
		Channels:   channels,
		Pagination: pagination,
	}
}
