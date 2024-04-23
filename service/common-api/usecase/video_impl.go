package usecase

import (
	"context"

	mapset "github.com/deckarep/golang-set/v2"
	"github.com/samber/lo"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/twitcasting"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/twitch"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/youtube"
	"github.com/sugar-cat7/vspo-portal/service/common-api/usecase/input"
)

type videoInteractor struct {
	creatorRepository repository.Creator
	videoRepository   repository.Video
	youtubeClient     youtube.YoutubeClient
	twitchClient      twitch.TwitchClient
	twitcastingClient twitcasting.TwitcastingClient
}

// NewVideoInteractor creates a new VideoInteractor
func NewVideoInteractor(
	creatorRepository repository.Creator,
	videoRepository repository.Video,
	youtubeClient youtube.YoutubeClient,
	twitchClient twitch.TwitchClient,
	twitcastingClient twitcasting.TwitcastingClient,
) VideoInteractor {
	return &videoInteractor{
		creatorRepository,
		videoRepository,
		youtubeClient,
		twitchClient,
		twitcastingClient,
	}
}

func (i *videoInteractor) UpsertAll(
	ctx context.Context,
	param *input.UpsertAllVideos,
) (model.Videos, error) {
	// validate input
	videoType, err := model.NewVideoType(param.VideoType)
	if err != nil {
		return nil, err
	}
	startedAt, endedAt, err := model.NewPeriod(param.Period)
	if err != nil {
		return nil, err
	}

	platformTypes, err := model.NewPlatforms(param.PlatformTypes)
	if err != nil {
		return nil, err
	}

	// Retrieve creators
	cs, err := i.creatorRepository.List(
		ctx,
		repository.ListCreatorsQuery{
			MemberTypes: model.VideoTypeToMemberTypes(videoType),
		},
	)
	if err != nil {
		return nil, err
	}

	// Retrieve existing videos
	q := repository.ListVideosQuery{
		VideoIDs:      param.VideoIDs,
		PlatformTypes: platformTypes.String(),
		VideoType:     videoType.String(),
		BroadcastStatus: []string{
			model.StatusLive.String(),
			model.StatusUpcoming.String(),
			model.StatusEnded.String(),
		},
		StartedAt: startedAt,
		EndedAt:   endedAt,
	}
	vs, err := i.videoRepository.List(
		ctx,
		q,
	)
	if err != nil {
		return nil, err
	}

	// Update videos by platform types
	uvs, err := i.updateVideosByPlatformTypes(
		ctx,
		cs,
		vs,
		platformTypes,
		videoType,
	)

	// Upsert Videos All
	updatedVideos, err := i.videoRepository.UpsertAll(
		ctx,
		uvs,
	)
	if err != nil {
		return nil, err
	}

	return updatedVideos, nil
}

func (i *videoInteractor) ytVideos(
	ctx context.Context,
	cs model.Creators,
	evs model.Videos,
	vt model.VideoType,
) (model.Videos, error) {
	// Retrieve new videos via youtube api
	liveYoutubeVideos, err := i.youtubeClient.SearchVideos(ctx, youtube.SearchVideosParam{
		SearchQuery: youtube.SearchQueryVspoJp,
		EventType:   youtube.EventTypeLive,
	})

	if err != nil {
		return nil, err
	}

	upcomingYoutubeVideos, err := i.youtubeClient.SearchVideos(ctx, youtube.SearchVideosParam{
		SearchQuery: youtube.SearchQueryVspoJp,
		EventType:   youtube.EventTypeUpcoming,
	})

	if err != nil {
		return nil, err
	}

	vs := append(liveYoutubeVideos, upcomingYoutubeVideos...)
	m := mapset.NewSet[string]()

	for _, v := range vs {
		m.Add(v.ID)
	}

	// Retrieve video details via youtube api
	ytVideos, err := i.youtubeClient.GetVideos(
		ctx,
		youtube.VideosParam{
			VideoIDs: m.ToSlice(),
		},
	)
	if err != nil {
		return nil, err
	}

	if vt == model.VideoTypeVspoBroadcast || vt == model.VideoTypeFreechat {
		ytVideos = ytVideos.FilterCreator(cs)
	}

	// FIXME: Filter Logic
	return ytVideos.FilterUpdateTarget(evs), nil
}

func (i *videoInteractor) twitchVideos(
	ctx context.Context,
	cs model.Creators,
	evs model.Videos,
) (model.Videos, error) {
	twitchUserIDs := lo.Map(cs, func(c *model.Creator, _ int) string {
		return c.Channel.Twitch.ID
	})
	newTwitchVideos, err := i.twitchClient.GetVideos(ctx, twitch.TwitchVideosParam{
		UserIDs: twitchUserIDs,
	})

	if err != nil {
		return nil, err
	}
	// FIXME: Filter Logic
	return newTwitchVideos.FilterUpdateTarget(evs), nil
}

func (i *videoInteractor) twitCastingVideos(
	ctx context.Context,
	cs model.Creators,
	evs model.Videos,
) (model.Videos, error) {
	twitCastingUserIDs := lo.Map(cs, func(c *model.Creator, _ int) string {
		return c.Channel.TwitCasting.ID
	})
	newTwitcastingVideos, err := i.twitcastingClient.GetVideos(ctx, twitcasting.TwitcastingVideosParam{
		UserIDs: twitCastingUserIDs,
	})

	if err != nil {
		return nil, err
	}
	// FIXME: Filter Logic
	return newTwitcastingVideos.FilterUpdateTarget(evs), nil
}

func (i *videoInteractor) updateVideosByPlatformTypes(
	ctx context.Context,
	cs model.Creators,
	evs model.Videos,
	pts model.Platforms,
	vt model.VideoType,
) (model.Videos, error) {
	var updatedVideos model.Videos
	for _, platformType := range pts.String() {
		switch platformType {
		case model.PlatformYouTube.String():
			newYoutubeVideos, err := i.ytVideos(ctx, cs, evs, vt)
			if err != nil {
				return nil, err
			}
			updatedVideos = append(updatedVideos, newYoutubeVideos...)
		case model.PlatformTwitch.String():
			newTwitchVideos, err := i.twitchVideos(ctx, cs, evs)
			if err != nil {
				return nil, err
			}
			updatedVideos = append(updatedVideos, newTwitchVideos...)
		case model.PlatformTwitCasting.String():
			newTwitcastingVideos, err := i.twitCastingVideos(ctx, cs, evs)
			if err != nil {
				return nil, err
			}
			updatedVideos = append(updatedVideos, newTwitcastingVideos...)
		}
	}
	return updatedVideos, nil
}
