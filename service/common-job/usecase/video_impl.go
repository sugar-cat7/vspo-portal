package usecase

import (
	"context"
	"fmt"
	"strings"
	"sync"

	mapset "github.com/deckarep/golang-set/v2"
	"github.com/samber/lo"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/twitcasting"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/twitch"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/youtube"
	"github.com/sugar-cat7/vspo-portal/service/common-job/pkg/uuid"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
	"github.com/volatiletech/null/v8"
)

type videoInteractor struct {
	transactable      repository.Transactable
	creatorRepository repository.Creator
	channelRepository repository.Channel
	videoRepository   repository.Video
	youtubeClient     youtube.YoutubeClient
	twitchClient      twitch.TwitchClient
	twitcastingClient twitcasting.TwitcastingClient
}

// NewVideoInteractor creates a new VideoInteractor
func NewVideoInteractor(
	transactable repository.Transactable,
	creatorRepository repository.Creator,
	channelRepository repository.Channel,
	videoRepository repository.Video,
	youtubeClient youtube.YoutubeClient,
	twitchClient twitch.TwitchClient,
	twitcastingClient twitcasting.TwitcastingClient,
) VideoInteractor {
	return &videoInteractor{
		transactable,
		creatorRepository,
		channelRepository,
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

			// Algorithm for detecting differences
			// 1. Retrieve existing video information
			existingVideos, err := i.videoRepository.List(
				ctx,
				repository.ListVideosQuery{
					PlatformTypes:   platformTypes.String(),
					VideoType:       videoType.String(),
					BroadcastStatus: []string{model.StatusLive.String(), model.StatusUpcoming.String(), model.StatusEnded.String()},
					BaseListOptions: repository.BaseListOptions{
						Limit: null.NewUint64(100, true),
						Page:  null.NewUint64(0, true),
					},
				},
			)
			if err != nil {
				return err
			}

			targetVideo := existingVideos.UpdateVideos(uvs, videoType)

			if len(targetVideo) == 0 {
				return nil
			}

			// Create creators and channels if they do not exist
			var crs model.Creators
			var chs model.Channels
			for _, uv := range targetVideo {
				b, err := i.channelRepository.Exist(
					ctx,
					repository.GetChannelQuery{
						ID: uv.CreatorInfo.ChannelID,
					},
				)
				if err != nil {
					return err
				}
				if !b {
					uuidCr := uuid.UUID()
					uuidCh := uuid.UUID()
					ch := &model.Channel{
						ID:        uuidCh,
						CreatorID: uuidCr,
					}
					cs := model.ChannelSnippet{
						ID: uv.CreatorInfo.ChannelID,
					}
					if uv.Platform == model.PlatformYouTube {
						ch.Youtube = cs
					} else if uv.Platform == model.PlatformTwitch {
						ch.Twitch = cs
					} else if uv.Platform == model.PlatformTwitCasting {
						ch.TwitCasting = cs
					}
					cr := model.NewCreator(
						uuidCr,
						"unknown",
						model.MemberTypeGeneral,
						model.ThumbnailURL(""),
						*ch,
					)
					chs = append(chs, ch)
					crs = append(crs, cr)
				}
			}
			if len(crs) != 0 {
				_, err = i.creatorRepository.BatchCreate(
					ctx,
					crs,
				)

				if err != nil {
					return err
				}

				_, err = i.channelRepository.BatchCreate(
					ctx,
					chs,
				)

				if err != nil {
					return err
				}
			}

			// Update existing videos
			_, err = i.videoRepository.BatchDeleteInsert(ctx, targetVideo)
			if err != nil {
				return err
			}

			v, err = i.videoRepository.List(
				ctx,
				repository.ListVideosQuery{
					VideoIDs: lo.Map(uvs, func(v *model.Video, _ int) string {
						return v.ID
					}),
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
	case model.VideoTypeVspoBroadcast:
		queries := []youtube.SearchQuery{youtube.SearchQueryVspoJp, youtube.SearchQueryVspoEn}
		eventTypes := []youtube.EventType{youtube.EventTypeLive, youtube.EventTypeUpcoming, youtube.EventTypeCompleted}
		for _, query := range queries {
			for _, eventType := range eventTypes {
				result, err := i.youtubeClient.SearchVideos(ctx, youtube.SearchVideosParam{
					SearchQuery: query,
					EventType:   eventType,
				})
				if err != nil {
					return nil, err
				}
				vs = append(vs, result...)
			}
		}

		err := i.transactable.RWTx(
			ctx,
			func(ctx context.Context) error {
				existVideos, err := i.videoRepository.List(
					ctx,
					repository.ListVideosQuery{
						PlatformTypes:   []string{model.PlatformYouTube.String()},
						BroadcastStatus: []string{model.StatusLive.String(), model.StatusUpcoming.String()},
						VideoType:       model.VideoTypeVspoBroadcast.String(),
						BaseListOptions: repository.BaseListOptions{
							Limit: null.NewUint64(100, true),
							Page:  null.NewUint64(0, true),
						},
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
						BaseListOptions: repository.BaseListOptions{
							Limit: null.NewUint64(50, true),
							Page:  null.NewUint64(0, true),
						},
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
	case model.VideoTypeVspoBroadcast:
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
	twitchUserIDs := lo.FilterMap(cs, func(c *model.Creator, _ int) (string, bool) {
		if c.Channel.Twitch.ID != "" {
			return c.Channel.Twitch.ID, true
		}
		return "", false
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
	twitCastingUserIDs := lo.FilterMap(cs, func(c *model.Creator, _ int) (string, bool) {
		if c.Channel.TwitCasting.ID != "" {
			return c.Channel.TwitCasting.ID, true
		}
		return "", false
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
	var mu sync.Mutex
	var wg sync.WaitGroup
	var errs []error

	for _, platformType := range pts.String() {
		wg.Add(1)
		go func(platformType string) {
			defer wg.Done()
			var newVideos model.Videos
			var err error

			switch platformType {
			case model.PlatformYouTube.String():
				newVideos, err = i.ytVideos(ctx, cs, vt)
			case model.PlatformTwitch.String():
				newVideos, err = i.twitchVideos(ctx, cs)
			case model.PlatformTwitCasting.String():
				newVideos, err = i.twitCastingVideos(ctx, cs)
			}

			mu.Lock()
			defer mu.Unlock()
			if err != nil {
				errs = append(errs, err)
				return
			}
			updatedVideos = append(updatedVideos, newVideos...)
		}(platformType)
	}

	wg.Wait()

	if len(errs) > 0 {
		errMessages := make([]string, len(errs))
		for i, err := range errs {
			errMessages[i] = err.Error()
		}
		return nil, fmt.Errorf("errors occurred: %v", strings.Join(errMessages, "; "))
	}

	return updatedVideos, nil
}
