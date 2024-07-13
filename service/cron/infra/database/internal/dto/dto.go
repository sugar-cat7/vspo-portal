package dto

import (
	"strings"

	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/cron/infra/database/internal/gen"
	utime "github.com/sugar-cat7/vspo-portal/service/cron/pkg/time"
)

// CreatorToModel converts db_sqlc.Creator to model.Creator
func CreatorToModel(c *db_sqlc.Creator) *model.Creator {
	return &model.Creator{
		ID:         c.ID,
		Name:       c.Name,
		MemberType: model.MemberType(c.MemberType),
	}
}

// ChannelToModel converts db_sqlc.Channel to model.Channel
func ChannelToModel(c *db_sqlc.Channel) *model.Channel {
	ch := &model.Channel{}
	snippet := model.ChannelSnippet{
		ID:              c.ID,
		Name:            c.Title,
		Description:     c.Description,
		ThumbnailURL:    model.ThumbnailURL(c.ThumbnailUrl),
		PublishedAt:     c.PublishedAt.Time,
		TotalViewCount:  int(c.TotalViewCount),
		SubscriberCount: int(c.SubscriberCount),
		TotalVideoCount: int(c.TotalVideoCount),
		IsDeleted:       c.IsDeleted,
	}

	switch c.PlatformType {
	case model.PlatformYouTube.String():
		ch.Youtube = snippet
	case model.PlatformTwitch.String():
		ch.Twitch = snippet
	case model.PlatformTwitCasting.String():
		ch.TwitCasting = snippet
	case model.PlatformNiconico.String():
		ch.Niconico = snippet
	}
	return ch
}

// VideoToModel converts db_sqlc.Video to model.Video
func VideoToModel(v *db_sqlc.Video) *model.Video {
	m := &model.Video{
		ID:           v.ID,
		Title:        v.Title,
		Description:  v.Description,
		PublishedAt:  &v.PublishedAt.Time,
		StartedAt:    &v.StartedAt.Time,
		EndedAt:      &v.EndedAt.Time,
		Platform:     model.Platform(v.PlatformType),
		Status:       model.Status(v.BroadcastStatus),
		Tags:         strings.Split(v.Tags, ","),
		ViewCount:    uint64(v.ViewCount),
		ThumbnailURL: model.ThumbnailURL(v.ThumbnailUrl),
		IsDeleted:    v.IsDeleted,
	}
	return m
}

// CreatorsWithChannelsRowToModel converts db_sqlc.GetCreatorsWithChannelsRow to model.Creator
func CreatorsWithChannelsRowToModel(c *db_sqlc.GetCreatorsWithChannelsRow, creator *model.Creator) {
	creator.Channel.ID = c.Channel.ID
	snippet := model.ChannelSnippet{
		ID:              c.Channel.PlatformChannelID,
		Name:            c.Channel.Title,
		Description:     c.Channel.Description,
		ThumbnailURL:    model.ThumbnailURL(c.Channel.ThumbnailUrl),
		PublishedAt:     c.Channel.PublishedAt.Time,
		TotalViewCount:  int(c.Channel.TotalViewCount),
		SubscriberCount: int(c.Channel.SubscriberCount),
		TotalVideoCount: int(c.Channel.TotalVideoCount),
		IsDeleted:       c.Channel.IsDeleted,
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
		}
		CreatorsWithChannelsRowToModel(&c, creator)
		creatorIDMap[c.Creator.ID] = creator
	}

	for _, c := range creatorIDMap {
		res = append(res, c)
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

// // ChannelModelToCreateChannelParams converts model.Channel to db_sqlc.CreateChannelParams
// func ChannelModelToCreateChannelParams(m *model.Channel) db_sqlc.CreateChannelParams {
// 	if m.Youtube.ID != "" {
// 		return db_sqlc.CreateChannelParams{
// 			ID:              m.Youtube.ID,
// 			CreatorID:       m.CreatorID,
// 			Title:           m.Youtube.Name,
// 			Description:     m.Youtube.Description,
// 			ThumbnailUrl:    string(m.Youtube.ThumbnailURL),
// 			PlatformType:    model.PlatformYouTube.String(),
// 			TotalViewCount:  int32(m.Youtube.TotalVideoCount),
// 			SubscriberCount: int32(m.Youtube.SubscriberCount),
// 			TotalVideoCount: int32(m.Youtube.TotalVideoCount),
// 		}
// 	} else if m.Twitch.ID != "" {
// 		return db_sqlc.CreateChannelParams{
// 			ID:              m.Twitch.ID,
// 			CreatorID:       m.CreatorID,
// 			Title:           m.Twitch.Name,
// 			Description:     m.Twitch.Description,
// 			ThumbnailUrl:    string(m.Twitch.ThumbnailURL),
// 			PlatformType:    model.PlatformTwitch.String(),
// 			TotalViewCount:  int32(m.Twitch.TotalVideoCount),
// 			SubscriberCount: int32(m.Twitch.SubscriberCount),
// 			TotalVideoCount: int32(m.Twitch.TotalVideoCount),
// 		}
// 	} else if m.TwitCasting.ID != "" {
// 		return db_sqlc.CreateChannelParams{
// 			ID:              m.TwitCasting.ID,
// 			CreatorID:       m.CreatorID,
// 			Title:           m.TwitCasting.Name,
// 			Description:     m.TwitCasting.Description,
// 			ThumbnailUrl:    string(m.TwitCasting.ThumbnailURL),
// 			PlatformType:    model.PlatformTwitCasting.String(),
// 			TotalViewCount:  int32(m.TwitCasting.TotalVideoCount),
// 			SubscriberCount: int32(m.TwitCasting.SubscriberCount),
// 			TotalVideoCount: int32(m.TwitCasting.TotalVideoCount),
// 		}
// 	} else if m.Niconico.ID != "" {
// 		return db_sqlc.CreateChannelParams{
// 			ID:              m.Niconico.ID,
// 			CreatorID:       m.CreatorID,
// 			Title:           m.Niconico.Name,
// 			Description:     m.Niconico.Description,
// 			ThumbnailUrl:    string(m.Niconico.ThumbnailURL),
// 			PlatformType:    model.PlatformNiconico.String(),
// 			TotalViewCount:  int32(m.Niconico.TotalVideoCount),
// 			SubscriberCount: int32(m.Niconico.SubscriberCount),
// 			TotalVideoCount: int32(m.Niconico.TotalVideoCount),
// 		}
// 	} else {
// 		return db_sqlc.CreateChannelParams{}
// 	}
// }

// VideoModelToCreateVideoParams converts model.Video to db_sqlc.CreateVideoParams
func VideoModelToCreateVideoParams(m *model.Video) db_sqlc.CreateVideoParams {
	p := db_sqlc.CreateVideoParams{
		ID:              m.ID,
		ChannelID:       m.CreatorInfo.ChannelID,
		Title:           m.Title,
		Description:     m.Description,
		PlatformType:    m.Platform.String(),
		BroadcastStatus: m.Status.String(),
		VideoType:       m.VideoType.String(),
		Tags:            strings.Join(m.Tags, ","),
		ViewCount:       int32(m.ViewCount),
		ThumbnailUrl:    string(m.ThumbnailURL),
		IsDeleted:       m.IsDeleted,
	}
	if m.PublishedAt != nil {
		p.PublishedAt = utime.TimeToTimestamptz(*m.PublishedAt)
	}
	if m.StartedAt != nil {
		p.StartedAt = utime.TimeToTimestamptz(*m.StartedAt)
	}
	if m.EndedAt != nil {
		p.EndedAt = utime.TimeToTimestamptz(*m.EndedAt)
	}
	return p
}

// CreatorModelToCreateCreatorParams converts model.Creator to db_sqlc.CreateCreatorParams
func CreatorModelToCreateCreatorParams(m *model.Creator) db_sqlc.CreateCreatorParams {
	return db_sqlc.CreateCreatorParams{
		ID:         m.ID,
		Name:       m.Name,
		MemberType: m.MemberType.String(),
	}
}

// VideoModelsToCreateVideoParams converts model.Videos to []db_sqlc.CreateVideoParams
func VideoModelsToCreateVideoParams(m model.Videos) []db_sqlc.CreateVideoParams {
	ps := []db_sqlc.CreateVideoParams{}
	for _, v := range m {
		ps = append(ps, VideoModelToCreateVideoParams(v))
	}
	return ps
}

// CreatorModelsToCreateCreatorParams converts model.Creators to []db_sqlc.CreateCreatorParams
func CreatorModelsToCreateCreatorParams(m model.Creators) []db_sqlc.CreateCreatorParams {
	ps := []db_sqlc.CreateCreatorParams{}
	for _, c := range m {
		ps = append(ps, CreatorModelToCreateCreatorParams(c))
	}
	return ps
}

// ChannelModelsToCreateChannelParams converts model.Channels to []db_sqlc.CreateChannelParams
func ChannelModelsToCreateChannelParams(m model.Channels) []db_sqlc.CreateChannelParams {
	ps := []db_sqlc.CreateChannelParams{}
	for _, c := range m {
		ps = append(ps, ChannelModelToCreateChannelParams(c))
	}
	return ps
}

// ChannelModelToCreateChannelParams converts model.Channel to db_sqlc.CreateChannelParams
func ChannelModelToCreateChannelParams(m *model.Channel) db_sqlc.CreateChannelParams {
	p := db_sqlc.CreateChannelParams{
		CreatorID: m.CreatorID,
	}

	if m.Youtube.ID != "" {
		p.ID = m.ID
		p.PlatformChannelID = m.Youtube.ID
		p.PlatformType = model.PlatformYouTube.String()
		p.Title = m.Youtube.Name
		p.Description = m.Youtube.Description
		p.PublishedAt = utime.TimeToTimestamptz(m.Youtube.PublishedAt)
		p.TotalViewCount = int32(m.Youtube.TotalViewCount)
		p.SubscriberCount = int32(m.Youtube.SubscriberCount)
		p.HiddenSubscriberCount = false
		p.TotalVideoCount = int32(m.Youtube.TotalVideoCount)
		p.ThumbnailUrl = string(m.Youtube.ThumbnailURL)
		p.IsDeleted = m.Youtube.IsDeleted
	} else if m.Twitch.ID != "" {
		p.ID = m.ID
		p.PlatformChannelID = m.Twitch.ID
		p.PlatformType = model.PlatformTwitch.String()
		p.Title = m.Twitch.Name
		p.Description = m.Twitch.Description
		p.PublishedAt = utime.TimeToTimestamptz(m.Twitch.PublishedAt)
		p.TotalViewCount = int32(m.Twitch.TotalViewCount)
		p.SubscriberCount = int32(m.Twitch.SubscriberCount)
		p.HiddenSubscriberCount = false
		p.TotalVideoCount = int32(m.Twitch.TotalVideoCount)
		p.ThumbnailUrl = string(m.Twitch.ThumbnailURL)
		p.IsDeleted = m.Twitch.IsDeleted
	} else if m.TwitCasting.ID != "" {
		p.ID = m.ID
		p.PlatformChannelID = m.TwitCasting.ID
		p.PlatformType = model.PlatformTwitCasting.String()
		p.Title = m.TwitCasting.Name
		p.Description = m.TwitCasting.Description
		p.PublishedAt = utime.TimeToTimestamptz(m.TwitCasting.PublishedAt)
		p.TotalViewCount = int32(m.TwitCasting.TotalViewCount)
		p.SubscriberCount = int32(m.TwitCasting.SubscriberCount)
		p.HiddenSubscriberCount = false
		p.TotalVideoCount = int32(m.TwitCasting.TotalVideoCount)
		p.ThumbnailUrl = string(m.TwitCasting.ThumbnailURL)
		p.IsDeleted = m.TwitCasting.IsDeleted
	} else if m.Niconico.ID != "" {
		p.ID = m.ID
		p.PlatformChannelID = m.Niconico.ID
		p.PlatformType = model.PlatformNiconico.String()
		p.Title = m.Niconico.Name
		p.Description = m.Niconico.Description
		p.PublishedAt = utime.TimeToTimestamptz(m.Niconico.PublishedAt)
		p.TotalViewCount = int32(m.Niconico.TotalViewCount)
		p.SubscriberCount = int32(m.Niconico.SubscriberCount)
		p.HiddenSubscriberCount = false
		p.TotalVideoCount = int32(m.Niconico.TotalVideoCount)
		p.ThumbnailUrl = string(m.Niconico.ThumbnailURL)
		p.IsDeleted = m.Niconico.IsDeleted
	}
	return p
}
