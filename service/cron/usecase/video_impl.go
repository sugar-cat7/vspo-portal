package usecase

import (
	"context"

	mapset "github.com/deckarep/golang-set/v2"
	"github.com/samber/lo"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/twitcasting"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/twitch"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/youtube"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
	"github.com/volatiletech/null/v8"
)

type videoInteractor struct {
	transactable      repository.Transactable
	creatorRepository repository.Creator
	videoRepository   repository.Video
	youtubeClient     youtube.YoutubeClient
	twitchClient      twitch.TwitchClient
	twitcastingClient twitcasting.TwitcastingClient
}

// NewVideoInteractor creates a new VideoInteractor
func NewVideoInteractor(
	transactable repository.Transactable,
	creatorRepository repository.Creator,
	videoRepository repository.Video,
	youtubeClient youtube.YoutubeClient,
	twitchClient twitch.TwitchClient,
	twitcastingClient twitcasting.TwitcastingClient,
) VideoInteractor {
	return &videoInteractor{
		transactable,
		creatorRepository,
		videoRepository,
		youtubeClient,
		twitchClient,
		twitcastingClient,
	}
}

func (i *videoInteractor) BatchDeleteInsert(
	ctx context.Context,
	param *input.UpsertVideos,
) (model.Videos, error) {
	// validate input
	videoType, err := model.NewVideoType(param.VideoType)
	if err != nil {
		return nil, err
	}
	// startedAt, endedAt, err := model.NewPeriod(param.Period)
	// if err != nil {
	// 	return nil, err
	// }
	platformTypes, err := model.NewPlatforms(param.PlatformTypes)
	if err != nil {
		return nil, err
	}
	var v model.Videos
	err = i.transactable.RWTx(
		ctx,
		func(ctx context.Context) error {
			// Retrieve creators
			cs, err := i.creatorRepository.List(
				ctx,
				repository.ListCreatorsQuery{
					MemberTypes: model.VideoTypeToMemberTypes(videoType),
				},
			)

			if err != nil {
				return err
			}

			// Update videos by platform types
			uvs, err := i.updateVideosByPlatformTypes(
				ctx,
				cs,
				platformTypes,
				videoType,
			)
			if err != nil {
				return err
			}

			// DeleteInsert Videos All
			_, err = i.videoRepository.BatchDeleteInsert(
				ctx,
				uvs,
			)
			if err != nil {
				return err
			}

			v, err = i.videoRepository.List(
				ctx,
				repository.ListVideosQuery{
					VideoIDs: lo.Map(uvs, func(v *model.Video, _ int) string {
						return v.ID
					}),
					BaseListOptions: repository.BaseListOptions{
						Limit: null.NewUint64(100, true), // null.Uint64型の値を正しく初期化
					},
				})

			if err != nil {
				return err
			}

			return nil
		},
	)
	if err != nil {
		return nil, err
	}
	return v, nil
}

func (i *videoInteractor) ytVideos(
	ctx context.Context,
	cs model.Creators,
	vt model.VideoType,
) (model.Videos, error) {
	var vs model.Videos
	var freeChats model.Videos
	switch vt {
	case model.VideoTypeAll, model.VideoTypeVspoBroadcast:
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
		vs = append(liveYoutubeVideos, upcomingYoutubeVideos...)
		err = i.transactable.RWTx(
			ctx,
			func(ctx context.Context) error {
				existVideos, err := i.videoRepository.List(
					ctx,
					repository.ListVideosQuery{
						PlatformTypes:   []string{model.PlatformYouTube.String()},
						BroadcastStatus: []string{model.StatusLive.String(), model.StatusUpcoming.String()},
						VideoType:       model.VideoTypeVspoBroadcast.String(),
					},
				)
				if err != nil {
					return err
				}
				vs = append(vs, existVideos...)

				freeChats, err = i.videoRepository.List(
					ctx,
					repository.ListVideosQuery{
						PlatformTypes:   []string{model.PlatformYouTube.String()},
						BroadcastStatus: []string{model.StatusLive.String(), model.StatusUpcoming.String()},
						VideoType:       model.VideoTypeFreechat.String(),
					},
				)
				if err != nil {
					return err
				}
				return nil
			},
		)
		if err != nil {
			return nil, err
		}
	case model.VideoTypeClip:
		// TODO: Implement
	}

	m := mapset.NewSet[string]()
	// Non freechat videos
	for _, v := range vs {
		flag := false
		for _, f := range freeChats {
			if v.ID == f.ID {
				flag = true
				break
			}
		}
		if flag {
			continue
		}
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

	switch vt {
	case model.VideoTypeAll, model.VideoTypeVspoBroadcast:
		// All new videos are VspoBroadcast
		ytVideos.SetVideoType(model.VideoTypeVspoBroadcast)
	case model.VideoTypeClip:
		ytVideos.SetVideoType(model.VideoTypeClip)
	}
	return ytVideos, nil
}

func (i *videoInteractor) twitchVideos(
	ctx context.Context,
	cs model.Creators,
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
	return newTwitchVideos, nil
}

func (i *videoInteractor) twitCastingVideos(
	ctx context.Context,
	cs model.Creators,
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
	return newTwitcastingVideos, nil
}

func (i *videoInteractor) updateVideosByPlatformTypes(
	ctx context.Context,
	cs model.Creators,
	pts model.Platforms,
	vt model.VideoType,
) (model.Videos, error) {
	var updatedVideos model.Videos
	for _, platformType := range pts.String() {
		switch platformType {
		case model.PlatformYouTube.String():
			newYoutubeVideos, err := i.ytVideos(ctx, cs, vt)
			if err != nil {
				return nil, err
			}
			updatedVideos = append(updatedVideos, newYoutubeVideos...)
		case model.PlatformTwitch.String():
			newTwitchVideos, err := i.twitchVideos(ctx, cs)
			if err != nil {
				return nil, err
			}
			updatedVideos = append(updatedVideos, newTwitchVideos...)
		case model.PlatformTwitCasting.String():
			newTwitcastingVideos, err := i.twitCastingVideos(ctx, cs)
			if err != nil {
				return nil, err
			}
			updatedVideos = append(updatedVideos, newTwitcastingVideos...)
		}
	}
	return updatedVideos, nil
}
