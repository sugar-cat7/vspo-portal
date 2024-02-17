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
	createRepository  repository.Creator
	videoRepository   repository.Video
	youtubeClient     youtube.YoutubeClient
	twitchClient      twitch.TwitchClient
	twitcastingClient twitcasting.TwitcastingClient
}

// NewVideoInteractor creates a new VideoInteractor
func NewVideoInteractor(
	createRepository repository.Creator,
	videoRepository repository.Video,
	youtubeClient youtube.YoutubeClient,
	twitchClient twitch.TwitchClient,
	twitcastingClient twitcasting.TwitcastingClient,
) VideoInteractor {
	return &videoInteractor{
		createRepository,
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
	cs, err := i.createRepository.List(
		ctx,
		repository.ListCreatorsQuery{
			IsOnlyVspoMember: model.VideoType(param.VideoType) == model.VideoTypeVspoBroadcast,
		},
	)
	if err != nil {
		return nil, err
	}

	// Retrieve existing videos
	q := repository.ListVideosQuery{}
	vs, err := i.videoRepository.List(
		ctx,
		q,
	)
	if err != nil {
		return nil, err
	}
	var updatedVideos model.Videos
	if param.PlatformType == model.PlatformYouTube.String() {
		newYoutubeVideos, err := i.youtubeVideos(ctx, cs, vs)
		if err != nil {
			return nil, err
		}
		updatedVideos = append(updatedVideos, newYoutubeVideos...)
	}
	if param.PlatformType == model.PlatformTwitch.String() {
		newTwitchVideos, err := i.twitchVideos(ctx, cs, vs)
		if err != nil {
			return nil, err
		}
		updatedVideos = append(updatedVideos, newTwitchVideos...)
	}
	if param.PlatformType == model.PlatformTwitCasting.String() {
		newTwitcastingVideos, err := i.twitCastingVideos(ctx, cs, vs)
		if err != nil {
			return nil, err
		}
		updatedVideos = append(updatedVideos, newTwitcastingVideos...)
	}

	// Upsert Videos All
	updatedVideos, err = i.videoRepository.UpsertAll(
		ctx,
		updatedVideos,
	)
	if err != nil {
		return nil, err
	}

	return updatedVideos, nil
}

func (i *videoInteractor) youtubeVideos(
	ctx context.Context,
	cs model.Creators,
	existVideos model.Videos,
) (model.Videos, error) {
	// Retrieve new videos via youtube api
	liveYoutubeVideos, err := i.youtubeClient.SearchVideos(ctx, youtube.YoutubeSearchVideosParam{
		SearchQuery: youtube.SearchQueryVspoJp,
		EventType:   youtube.EventTypeLive,
	})

	if err != nil {
		return nil, err
	}

	upcomingYoutubeVideos, err := i.youtubeClient.SearchVideos(ctx, youtube.YoutubeSearchVideosParam{
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
	youtubeVideos, err := i.youtubeClient.GetVideos(
		ctx,
		youtube.YoutubeVideosParam{
			VideoIDs: m.ToSlice(),
		},
	)
	if err != nil {
		return nil, err
	}

	return youtubeVideos.FilterUpdateTarget(existVideos).FilterCreator(cs), nil
}

func (i *videoInteractor) twitchVideos(
	ctx context.Context,
	cs model.Creators,
	existVideos model.Videos,
) (model.Videos, error) {
	twitchUserIDs := lo.Map(cs, func(c *model.Creator, _ int) string {
		return c.Channel.Twitch.ChannelID
	})
	newTwitchVideos, err := i.twitchClient.GetVideos(ctx, twitch.TwitchVideosParam{
		UserIDs: twitchUserIDs,
	})

	if err != nil {
		return nil, err
	}

	return newTwitchVideos.FilterUpdateTarget(existVideos).FilterCreator(cs), nil
}

func (i *videoInteractor) twitCastingVideos(
	ctx context.Context,
	cs model.Creators,
	existVideos model.Videos,
) (model.Videos, error) {
	twitCastingUserIDs := lo.Map(cs, func(c *model.Creator, _ int) string {
		return c.Channel.TwitCasting.ChannelID
	})
	newTwitcastingVideos, err := i.twitcastingClient.GetVideos(ctx, twitcasting.TwitcastingVideosParam{
		UserIDs: twitCastingUserIDs,
	})

	if err != nil {
		return nil, err
	}

	return newTwitcastingVideos.FilterUpdateTarget(existVideos).FilterCreator(cs), nil
}
