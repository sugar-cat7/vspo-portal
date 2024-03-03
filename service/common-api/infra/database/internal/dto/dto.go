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

// CreatorsWithChannelsRowToModel converts db_sqlc.GetCreatorsWithChannelsRow to model.Creator
func CreatorsWithChannelsRowToModel(c *db_sqlc.GetCreatorsWithChannelsRow, creator *model.Creator) {
	snippet := model.ChannelSnippet{
		ID:           c.Channel.ID,
		Name:         c.Channel.Title,
		Description:  c.Channel.Description,
		ThumbnailURL: model.ThumbnailURL(c.Channel.ThumbnailUrl),
		IsDeleted:    c.Channel.IsDeleted,
	}

	switch c.Channel.PlatformType {
	case model.PlatformYouTube.String():
		creator.Channel.Youtube = snippet
	case model.PlatformTwitch.String():
		creator.Channel.Twitch = snippet
	case model.PlatformTwitCasting.String():
		creator.Channel.TwitCasting = snippet
	case model.PlatformNiconico.String():
		creator.Channel.Niconico = snippet
	}
}

// CreatorsWithChannelsRowsToModel converts []db_sqlc.GetCreatorsWithChannelsRow to model.Creators
func CreatorsWithChannelsRowsToModel(cs []db_sqlc.GetCreatorsWithChannelsRow) model.Creators {
	res := make(model.Creators, 0)

	creatorIDMap := map[string]*model.Creator{}
	for _, c := range cs {
		creator, exists := creatorIDMap[c.Creator.ID]
		if !exists {
			creator = &model.Creator{
				ID:      c.Creator.ID,
				Name:    c.Creator.Name,
				Channel: model.Channel{},
			}
			creatorIDMap[c.Creator.ID] = creator
			res = append(res, creator)
		}
		CreatorsWithChannelsRowToModel(&c, creator)
	}

	return res
}

// CreatorsByIDsRowToModel converts db_sqlc.GetCreatorsByIDsRow to model.Creator
func CreatorsByIDsRowToModel(c *db_sqlc.GetCreatorsByIDsRow, creator *model.Creator) {
	snippet := model.ChannelSnippet{
		ID:           c.Channel.ID,
		Name:         c.Channel.Title,
		Description:  c.Channel.Description,
		ThumbnailURL: model.ThumbnailURL(c.Channel.ThumbnailUrl),
		IsDeleted:    c.Channel.IsDeleted,
	}

	switch c.Channel.PlatformType {
	case model.PlatformYouTube.String():
		creator.Channel.Youtube = snippet
	case model.PlatformTwitch.String():
		creator.Channel.Twitch = snippet
	case model.PlatformTwitCasting.String():
		creator.Channel.TwitCasting = snippet
	case model.PlatformNiconico.String():
		creator.Channel.Niconico = snippet
	}
}

// CreatorsByIDsRowsToModel converts []db_sqlc.GetCreatorsByIDsRow to model.Creators
func CreatorsByIDsRowsToModel(cs []db_sqlc.GetCreatorsByIDsRow) model.Creators {
	res := make(model.Creators, 0)

	creatorIDMap := map[string]*model.Creator{}
	for _, c := range cs {
		creator, exists := creatorIDMap[c.Creator.ID]
		if !exists {
			creator = &model.Creator{
				ID:      c.Creator.ID,
				Name:    c.Creator.Name,
				Channel: model.Channel{},
			}
			creatorIDMap[c.Creator.ID] = creator
			res = append(res, creator)
		}
		CreatorsByIDsRowToModel(&c, creator)
	}

	return res
}

// VideosByIDsRowsToModel converts []db_sqlc.GetVideosByIDsRow to model.Videos
func VideosByIDsRowsToModel(vs []db_sqlc.GetVideosByIDsRow) model.Videos {
	res := make(model.Videos, 0)
	for _, v := range vs {
		res = append(res, VideoToModel(&v.Video))
	}
	return res
}

// VideosByParamsRowsToModel converts []db_sqlc.GetVideosByParamsRow to model.Videos
func VideosByParamsRowsToModel(vs []db_sqlc.GetVideosByParamsRow) model.Videos {
	res := make(model.Videos, 0)
	for _, v := range vs {
		res = append(res, VideoToModel(&v.Video))
	}
	return res
}

// ChannelModelToCreateChannelParams converts model.Channel to db_sqlc.CreateChannelParams
func ChannelModelToCreateChannelParams(m *model.Channel) db_sqlc.CreateChannelParams {
	return db_sqlc.CreateChannelParams{}
}

// VideoModelToCreateVideoParams converts model.Video to db_sqlc.CreateVideoParams
func VideoModelToCreateVideoParams(m *model.Video) db_sqlc.CreateVideoParams {
	return db_sqlc.CreateVideoParams{}
}

// CreatorModelToCreateCreatorParams converts model.Creator to db_sqlc.CreateCreatorParams
func CreatorModelToCreateCreatorParams(m *model.Creator) db_sqlc.CreateCreatorParams {
	return db_sqlc.CreateCreatorParams{}
}

// ChannelModelsToCreateChannelParams converts model.Channels to []db_sqlc.CreateChannelParams
func ChannelModelsToCreateChannelParams(m model.Channels) []db_sqlc.CreateChannelParams {
	return []db_sqlc.CreateChannelParams{}
}

// VideoModelsToCreateVideoParams converts model.Videos to []db_sqlc.CreateVideoParams
func VideoModelsToCreateVideoParams(m model.Videos) []db_sqlc.CreateVideoParams {
	return []db_sqlc.CreateVideoParams{}
}

// CreatorModelsToCreateCreatorParams converts model.Creators to []db_sqlc.CreateCreatorParams
func CreatorModelsToCreateCreatorParams(m model.Creators) []db_sqlc.CreateCreatorParams {
	return []db_sqlc.CreateCreatorParams{}
}
