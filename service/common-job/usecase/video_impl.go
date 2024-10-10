package usecase

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"

	"github.com/samber/lo"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/twitcasting"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/twitch"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/youtube"
	trace "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/otel"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
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
	tracer, err := trace.GetTracerFromContext(ctx)
	if err != nil {
		return 0, err
	}
	ctx, span := tracer.Start(ctx, "Usecase#UpdatePlatformVideos")
	defer span.End()

	// validate input
	videoType, err := model.NewVideoType(param.VideoType)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "Invalid video type")
		return 0, err
	}

	platformTypes, err := model.NewPlatforms(param.PlatformTypes)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "Invalid platform types")
		return 0, err
	}

	var updatedCount int
	err = i.transactable.RWTx(
		ctx,
		func(ctx context.Context) error {
			ctx, subSpan := tracer.Start(ctx, "RetrieveCreators")
			defer subSpan.End()

			// Retrieve creators
			cs, err := i.creatorRepository.List(
				ctx,
				repository.ListCreatorsQuery{
					MemberTypes: model.VideoTypeToMemberTypes(videoType),
				},
			)
			if err != nil {
				subSpan.RecordError(err)
				subSpan.SetStatus(codes.Error, "Failed to list creators")
				return err
			}

			ctx, updateSpan := tracer.Start(ctx, "UpdateVideosByPlatformTypes")
			defer updateSpan.End()

			// Update videos by platform types
			uvs, err := i.updateVideosByPlatformTypes(
				ctx,
				cs,
				platformTypes,
				videoType,
			)
			if err != nil {
				updateSpan.RecordError(err)
				updateSpan.SetStatus(codes.Error, "Failed to update videos by platform types")
				return err
			}

			ctx, existSpan := tracer.Start(ctx, "ListExistingVideos")
			defer existSpan.End()

			existVs, err := i.videoRepository.ListByIDs(
				ctx,
				repository.ListByIDsQuery{
					VideoIDs: uvs.IDs(),
				},
			)
			if err != nil {
				existSpan.RecordError(err)
				existSpan.SetStatus(codes.Error, "Failed to list existing videos")
				return err
			}

			// Update logic
			uvs = uvs.FilterByChannels(cs.RetrieveChannels())
			uvs = uvs.FilterUpdatedVideos(existVs)

			// Creator info update
			uvs = uvs.UpdateCreatorInfo(cs)

			ctx, batchSpan := tracer.Start(ctx, "BatchDeleteInsertVideos")
			defer batchSpan.End()

			_, err = i.videoRepository.BatchDeleteInsert(ctx, uvs)
			if err != nil {
				batchSpan.RecordError(err)
				batchSpan.SetStatus(codes.Error, "Failed to batch insert videos")
				return err
			}

			updatedCount = len(uvs)
			return nil
		},
	)

	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "Transaction failed")
		return 0, err
	}

	span.SetStatus(codes.Ok, "Success")
	span.SetAttributes(attribute.Int("updatedCount", updatedCount))

	return updatedCount, nil
}

func (i *videoInteractor) ytVideos(
	ctx context.Context,
	vt model.VideoType,
) (model.Videos, error) {
	tracer, err := trace.GetTracerFromContext(ctx)
	if err != nil {
		return nil, err
	}
	ctx, span := tracer.Start(ctx, "Usecase#ytVideos")
	defer span.End()

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
					span.RecordError(err)
					span.SetStatus(codes.Error, "Failed to search YouTube videos")
					return nil, err
				}
				result.SetVideoType(model.VideoTypeVspoStream)
				vs = append(vs, result...)
			}
		}
	case model.VideoTypeClip:
		// TODO: Implement
	}
	span.SetStatus(codes.Ok, "Success")
	return vs, nil
}

func (i *videoInteractor) twitchVideos(
	ctx context.Context,
	twitchUserIDs []string,
) (model.Videos, error) {
	tracer, err := trace.GetTracerFromContext(ctx)
	if err != nil {
		return nil, err
	}
	ctx, span := tracer.Start(ctx, "Usecase#twitchVideos")
	defer span.End()

	newTwitchVideos, err := i.twitchClient.GetVideos(ctx, twitch.TwitchVideosParam{
		UserIDs: twitchUserIDs,
	})

	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "Failed to get Twitch videos")
		return nil, err
	}
	newTwitchVideos.SetVideoType(model.VideoTypeVspoStream)
	span.SetStatus(codes.Ok, "Success")
	return newTwitchVideos, nil
}

func (i *videoInteractor) twitCastingVideos(
	ctx context.Context,
	twitCastingUserIDs []string,
) (model.Videos, error) {
	tracer, err := trace.GetTracerFromContext(ctx)
	if err != nil {
		return nil, err
	}
	ctx, span := tracer.Start(ctx, "Usecase#twitCastingVideos")
	defer span.End()

	newTwitcastingVideos, err := i.twitcastingClient.GetVideos(ctx, twitcasting.TwitcastingVideosParam{
		UserIDs: twitCastingUserIDs,
	})

	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "Failed to get TwitCasting videos")
		return nil, err
	}
	newTwitcastingVideos.SetVideoType(model.VideoTypeVspoStream)
	span.SetStatus(codes.Ok, "Success")
	return newTwitcastingVideos, nil
}

func (i *videoInteractor) updateVideosByPlatformTypes(
	ctx context.Context,
	cs model.Creators,
	pts model.Platforms,
	vt model.VideoType,
) (model.Videos, error) {
	tracer, err := trace.GetTracerFromContext(ctx)
	if err != nil {
		return nil, err
	}
	ctx, span := tracer.Start(ctx, "Usecase#updateVideosByPlatformTypes")
	defer span.End()

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
		span.RecordError(errors.New(strings.Join(errMessages, "; ")))
		span.SetStatus(codes.Error, "Errors occurred while updating videos")
		return nil, fmt.Errorf("errors occurred: %v", strings.Join(errMessages, "; "))
	}

	span.SetStatus(codes.Ok, "Success")
	return updatedVideos, nil
}

func (i *videoInteractor) UpdatwExistVideos(
	ctx context.Context,
	param *input.UpdateExistVideos,
) (int, error) {
	tracer, err := trace.GetTracerFromContext(ctx)
	if err != nil {
		return 0, err
	}
	ctx, span := tracer.Start(ctx, "Usecase#UpdatwExistVideos")
	defer span.End()

	var updatedCount int
	err = i.transactable.RWTx(
		ctx,
		func(ctx context.Context) error {
			ctx, subSpan := tracer.Start(ctx, "RetrieveCreators")
			defer subSpan.End()

			// Retrieve creators
			cs, err := i.creatorRepository.List(
				ctx,
				repository.ListCreatorsQuery{
					MemberTypes: model.VideoTypeToMemberTypes(model.VideoTypeVspoStream),
				},
			)
			if err != nil {
				subSpan.RecordError(err)
				subSpan.SetStatus(codes.Error, "Failed to list creators")
				return err
			}

			ctx, existSpan := tracer.Start(ctx, "ListExistingVideos")
			defer existSpan.End()

			// Retrieve existing videos in the specified time range
			existVs, err := i.videoRepository.ListByTimeRange(
				ctx,
				repository.ListByTimeRangeQuery{
					StartedAt: param.StartedAt,
					EndedAt:   param.EndedAt,
				},
			)
			if err != nil {
				existSpan.RecordError(err)
				existSpan.SetStatus(codes.Error, "Failed to list existing videos")
				return err
			}

			ctx, ytSpan := tracer.Start(ctx, "RetrieveYouTubeVideos")
			defer ytSpan.End()

			// Retrieve YouTube videos by existing video IDs
			uvs, err := i.youtubeClient.GetVideos(ctx, youtube.VideosParam{
				VideoIDs: existVs.IDs(),
			})
			if err != nil {
				ytSpan.RecordError(err)
				ytSpan.SetStatus(codes.Error, "Failed to retrieve YouTube videos")
				return err
			}

			ctx, deleteSpan := tracer.Start(ctx, "DeleteDeletedVideos")
			defer deleteSpan.End()

			// Identify and delete videos that no longer exist
			deleted := existVs.FilterDeletedVideos(uvs)
			err = i.videoRepository.BatchDelete(ctx, deleted)
			if err != nil {
				deleteSpan.RecordError(err)
				deleteSpan.SetStatus(codes.Error, "Failed to delete videos")
				return err
			}

			ctx, updateSpan := tracer.Start(ctx, "InsertUpdatedVideos")
			defer updateSpan.End()

			// Update the creator information for the videos and filter the updated ones
			updated := uvs.FilterUpdatedVideos(existVs)
			updated = updated.UpdateCreatorInfo(cs)

			_, err = i.videoRepository.BatchDeleteInsert(ctx, updated)
			if err != nil {
				updateSpan.RecordError(err)
				updateSpan.SetStatus(codes.Error, "Failed to update videos")
				return err
			}

			updatedCount = len(updated) + len(deleted)

			return nil
		},
	)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "Transaction failed")
		return 0, err
	}

	span.SetStatus(codes.Ok, "Success")
	span.SetAttributes(attribute.Int("updatedCount", updatedCount))

	return updatedCount, nil
}
