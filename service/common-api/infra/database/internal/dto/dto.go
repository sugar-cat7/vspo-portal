package dto

import (
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/internal/db"
)

// CreatorToModel converts db_sqlc.Creator to model.Creator
func CreatorToModel(c *db_sqlc.Creator) *model.Creator {
	return &model.Creator{
		ID:   c.ID,
		Name: c.Name,
	}
}

// ChannelToModel converts db_sqlc.Channel to model.Channel
func ChannelToModel(c *db_sqlc.Channel) *model.Channel {
	return &model.Channel{}
}

// VideoToModel converts db_sqlc.Video to model.Video
func VideoToModel(v *db_sqlc.Video) *model.Video {
	return &model.Video{
		ID:          v.ID,
		Title:       v.Title,
		Description: v.Description,
	}
}
