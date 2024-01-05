package model

import "math"

type Pagination struct {
	CurrentPage uint64
	PrevPage    uint64
	NextPage    uint64
	TotalPage   uint64
	TotalCount  uint64
	HasNext     bool
}

func NewPagination(
	page uint64,
	limit uint64,
	totalCount uint64,
) *Pagination {
	pagination := &Pagination{
		TotalCount: totalCount,
	}

	if page <= 0 {
		pagination.CurrentPage = 1
		pagination.TotalPage = 1
		pagination.HasNext = false
	} else {
		pagination.CurrentPage = page
		pagination.PrevPage = page - 1
		pagination.TotalPage = uint64(math.Ceil(float64(totalCount) / float64(limit)))
		pagination.HasNext = page*limit < totalCount

		if page < pagination.TotalPage {
			pagination.NextPage = page + 1
		}
	}

	return pagination
}
