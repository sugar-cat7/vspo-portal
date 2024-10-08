package dto

import (
	"strings"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/internal/gen"
	utime "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/time"
	"github.com/sugar-cat7/vspo-portal/service/common-job/pkg/uuid"
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
	ch := &model.Channel{
		ID:        c.ID,
		CreatorID: c.CreatorID,
	}
	snippet := model.ChannelSnippet{
		ID:              c.PlatformChannelID,
		Name:            c.Title,
		Description:     c.Description,
		ThumbnailURL:    model.ThumbnailURL(c.ThumbnailUrl),
		PublishedAt:     c.PublishedAt.Time,
		TotalViewCount:  int(c.TotalViewCount),
		SubscriberCount: int(c.SubscriberCount),
		TotalVideoCount: int(c.TotalVideoCount),
		UpdateAt:        c.UpdatedAt.Time,
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

// ChannelsToModel converts []db_sqlc.Channel to model.Channels
func ChannelsToModel(cs []db_sqlc.Channel) model.Channels {
	res := make(model.Channels, 0)
	for _, c := range cs {
		res = append(res, ChannelToModel(&c))
	}
	return res
}

// VideoToModel converts db_sqlc.Video to model.Video
func VideoToModel(v *db_sqlc.Video) *model.Video {
	m := &model.Video{
		ID:           v.ID,
		Title:        v.Title,
		Description:  v.Description,
		PublishedAt:  &v.PublishedAt.Time,
		Platform:     model.Platform(v.PlatformType),
		Tags:         strings.Split(v.Tags, ","),
		ThumbnailURL: model.ThumbnailURL(v.ThumbnailUrl),
		IsDeleted:    v.IsDeleted,
	}
	return m
}

func GetVideosByTimeRangeRowToModel(v *db_sqlc.GetVideosByTimeRangeRow) *model.Video {
	m := VideoToModel(&v.Video)
	m.ViewCount = uint64(v.StreamStatus.ViewCount)
	m.StartedAt = &v.StreamStatus.StartedAt.Time
	m.EndedAt = &v.StreamStatus.EndedAt.Time
	m.Status = model.Status(v.StreamStatus.Status)
	m.CreatorInfo = model.CreatorInfo{
		ID:        v.StreamStatus.CreatorID,
		ChannelID: v.Video.ChannelID,
	}
	return m
}

func GetVideosByTimeRangeRowsToModel(vs []db_sqlc.GetVideosByTimeRangeRow) model.Videos {
	res := make(model.Videos, len(vs))
	for i, v := range vs {
		res[i] = GetVideosByTimeRangeRowToModel(&v)
	}
	return res
}

// GetVideosByPlatformsWithStatusRowToModel converts db_sqlc.GetVideosByPlatformsWithStatusRow to model.Video
func GetVideosByPlatformsWithStatusRowToModel(v *db_sqlc.GetVideosByPlatformsWithStatusRow) *model.Video {
	m := VideoToModel(&v.Video)
	m.ViewCount = uint64(v.StreamStatus.ViewCount)
	m.StartedAt = &v.StreamStatus.StartedAt.Time
	m.EndedAt = &v.StreamStatus.EndedAt.Time
	m.Status = model.Status(v.StreamStatus.Status)
	m.CreatorInfo = model.CreatorInfo{
		ID:        v.StreamStatus.CreatorID,
		ChannelID: v.Video.ChannelID,
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
		UpdateAt:        c.Channel.UpdatedAt.Time,
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
func VideosByParamsRowsToModel(vs []db_sqlc.GetVideosByPlatformsWithStatusRow) model.Videos {
	res := make(model.Videos, 0)
	for _, v := range vs {
		res = append(res, GetVideosByPlatformsWithStatusRowToModel(&v))
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
		ID:           m.ID,
		ChannelID:    m.CreatorInfo.ChannelID,
		Title:        m.Title,
		Description:  m.Description,
		PlatformType: m.Platform.String(),
		VideoType:    m.VideoType.String(),
		Tags:         strings.Join(m.Tags, ","),
		ThumbnailUrl: string(m.ThumbnailURL),
		IsDeleted:    m.IsDeleted,
	}
	if m.PublishedAt != nil {
		p.PublishedAt = utime.TimeToTimestamptz(*m.PublishedAt)
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

// ChannelModelToUpdateChannelParams converts model.Channel to db_sqlc.UpdateChannelParams
func ChannelModelToUpdateChannelParams(m *model.Channel) db_sqlc.UpdateChannelParams {
	p := db_sqlc.UpdateChannelParams{
		Title:        m.Youtube.Name,
		Description:  m.Youtube.Description,
		ThumbnailUrl: string(m.Youtube.ThumbnailURL),
		UpdatedAt:    utime.TimeToTimestamptz(m.Youtube.UpdateAt),
	}

	if m.Youtube.ID != "" {
		p.PlatformChannelID = m.Youtube.ID
	} else if m.Twitch.ID != "" {
		p.PlatformChannelID = m.Twitch.ID
	} else if m.TwitCasting.ID != "" {
		p.PlatformChannelID = m.TwitCasting.ID
	}
	return p
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
		p.UpdatedAt = utime.TimeToTimestamptz(m.Youtube.UpdateAt)
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
		p.UpdatedAt = utime.TimeToTimestamptz(m.Twitch.UpdateAt)
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
		p.UpdatedAt = utime.TimeToTimestamptz(m.TwitCasting.UpdateAt)
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
		p.UpdatedAt = utime.TimeToTimestamptz(m.Niconico.UpdateAt)
		p.IsDeleted = m.Niconico.IsDeleted
	}
	return p
}

// VideoModelsToCreateStreamStatusParams converts model.Videos to []db_sqlc.CreateStreamStatusParams
func VideoModelsToCreateStreamStatusParams(m model.Videos) []db_sqlc.CreateStreamStatusParams {
	ps := []db_sqlc.CreateStreamStatusParams{}
	for _, v := range m {
		ps = append(ps, db_sqlc.CreateStreamStatusParams{
			ID:        uuid.UUID(),
			VideoID:   v.ID,
			CreatorID: v.CreatorInfo.ID,
			Status:    v.Status.String(),
			UpdatedAt: utime.TimeToTimestamptz(utime.Utc.Now()),
			ViewCount: int32(v.ViewCount),
			StartedAt: utime.TimeToTimestamptz(*v.StartedAt),
			EndedAt:   utime.TimeToTimestamptz(*v.EndedAt),
		})
	}
	return ps
}

func VideosByTimeRangeRowsToModel(vs []db_sqlc.GetVideosByTimeRangeRow) model.Videos {
	res := make(model.Videos, 0)
	for _, v := range vs {
		res = append(res, VideoToModel(&v.Video))
	}
	return res
}
