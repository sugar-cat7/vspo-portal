package input

type GetCreator struct {
	ID string
}

func NewGetCreator(
	id string,
) *GetCreator {
	return &GetCreator{
		ID: id,
	}
}

type ListCreators struct {
	ids   []string
	Page  uint64
	Limit uint64
}

func NewListCreators(
	ids []string,
	creatorType string,
	page uint64,
	limit uint64,
) *ListCreators {
	if page == 0 {
		page = 1
	}
	if limit == 0 {
		limit = 20
	}
	return &ListCreators{
		ids:   ids,
		Page:  page,
		Limit: limit,
	}
}
