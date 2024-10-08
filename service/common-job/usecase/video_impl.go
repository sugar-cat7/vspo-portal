package usecase

import (
	"context"
	"fmt"
	"strings"
	"sync"

	"github.com/samber/lo"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/twitcasting"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/twitch"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/youtube"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
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

func (i *videoInteractor) UpdatePlatformVideos(
	ctx context.Context,
	param *input.UpdatePlatformVideos,
) (int, error) {
	// validate input
	videoType, err := model.NewVideoType(param.VideoType)
	if err != nil {
		return 0, err
	}

	platformTypes, err := model.NewPlatforms(param.PlatformTypes)
	if err != nil {
		return 0, err
	}
	var updatedCount int
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

			existVs, err := i.videoRepository.ListByIDs(
				ctx,
				repository.ListByIDsQuery{
					VideoIDs: uvs.IDs(),
				})
			if err != nil {
				return err
			}

			uvs = uvs.FilterUpdatedVideos(existVs)
			// Update creator info
			uvs = uvs.UpdateCreatorInfo(cs)
			// Update existing videos
			_, err = i.videoRepository.BatchDeleteInsert(ctx, uvs)
			if err != nil {
				return err
			}

			updatedCount = len(uvs)
			return nil
		},
	)
	if err != nil {
		return 0, err
	}
	return updatedCount, nil
}

func (i *videoInteractor) ytVideos(
	ctx context.Context,
	vt model.VideoType,
) (model.Videos, error) {
	var vs model.Videos
	switch vt {
	case model.VideoTypeVspoStream:
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
				result.SetVideoType(model.VideoTypeVspoStream)
				vs = append(vs, result...)
			}
		}
	case model.VideoTypeClip:
		// TODO: Implement
	}
	return vs, nil
}

func (i *videoInteractor) twitchVideos(
	ctx context.Context,
	twitchUserIDs []string,
) (model.Videos, error) {
	newTwitchVideos, err := i.twitchClient.GetVideos(ctx, twitch.TwitchVideosParam{
		UserIDs: twitchUserIDs,
	})

	if err != nil {
		return nil, err
	}
	newTwitchVideos.SetVideoType(model.VideoTypeVspoStream)
	return newTwitchVideos, nil
}

func (i *videoInteractor) twitCastingVideos(
	ctx context.Context,
	twitCastingUserIDs []string,
) (model.Videos, error) {
	newTwitcastingVideos, err := i.twitcastingClient.GetVideos(ctx, twitcasting.TwitcastingVideosParam{
		UserIDs: twitCastingUserIDs,
	})

	if err != nil {
		return nil, err
	}
	newTwitcastingVideos.SetVideoType(model.VideoTypeVspoStream)
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

	twitchUserIDs := lo.FilterMap(cs, func(c *model.Creator, _ int) (string, bool) {
		if c.Channel.Twitch.ID != "" {
			return c.Channel.Twitch.ID, true
		}
		return "", false
	})

	twitCastingUserIDs := lo.FilterMap(cs, func(c *model.Creator, _ int) (string, bool) {
		if c.Channel.TwitCasting.ID != "" {
			return c.Channel.TwitCasting.ID, true
		}
		return "", false
	})

	for _, platformType := range pts.String() {
		wg.Add(1)
		go func(platformType string) {
			defer wg.Done()
			var newVideos model.Videos
			var err error

			switch platformType {
			case model.PlatformYouTube.String():
				newVideos, err = i.ytVideos(ctx, vt)
			case model.PlatformTwitch.String():
				newVideos, err = i.twitchVideos(ctx, twitchUserIDs)
			case model.PlatformTwitCasting.String():
				newVideos, err = i.twitCastingVideos(ctx, twitCastingUserIDs)
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

func (i *videoInteractor) UpdatwExistVideos(
	ctx context.Context,
	param *input.UpdateExistVideos,
) (int, error) {

	var updatedCount int
	err := i.transactable.RWTx(
		ctx,
		func(ctx context.Context) error {
			existVs, err := i.videoRepository.ListByTimeRange(
				ctx,
				repository.ListByTimeRangeQuery{
					StartedAt: param.StartedAt,
					EndedAt:   param.EndedAt,
				},
			)
			if err != nil {
				return err
			}

			uvs, err := i.youtubeClient.GetVideos(ctx, youtube.VideosParam{
				VideoIDs: existVs.IDs(),
			})
			if err != nil {
				return err
			}
			deleted := existVs.FilterDeletedVideos(uvs)
			err = i.videoRepository.BatchDelete(ctx, deleted)
			if err != nil {
				return err
			}
			updated := uvs.FilterUpdatedVideos(existVs)
			_, err = i.videoRepository.BatchDeleteInsert(ctx, updated)
			if err != nil {
				return err
			}
			updatedCount = len(updated) + len(deleted)

			return nil
		},
	)
	if err != nil {
		return 0, err
	}
	return updatedCount, nil
}
