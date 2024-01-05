package input

type GetChannel struct {
	ID string
}

func NewGetChannel(
	id string,
) *GetChannel {
	return &GetChannel{
		ID: id,
	}
}

type ListChannels struct {
	ids   []string
	Page  uint64
	Limit uint64
}

func NewListChannels(
	ids []string,
	page uint64,
	limit uint64,
) *ListChannels {
	if page == 0 {
		page = 1
	}
	if limit == 0 {
		limit = 30
	}
	return &ListChannels{
		ids:   ids,
		Page:  page,
		Limit: limit,
	}
}
