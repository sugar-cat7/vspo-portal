package youtube

import (
	"context"
	"fmt"
	"strings"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	domain_youtube "github.com/sugar-cat7/vspo-portal/service/common-job/domain/youtube"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/youtube/internal/dto"
	"github.com/sugar-cat7/vspo-portal/service/common-job/pkg"
	trace "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/otel"
	"go.opentelemetry.io/otel/codes"
	"google.golang.org/api/youtube/v3"
)

var _ domain_youtube.YoutubeClient = (*youtubeServiceImpl)(nil)

type youtubeServiceImpl struct {
	service *youtube.Service
}

// NewService returns a new YoutubeClient.
func NewService(apiKey string) domain_youtube.YoutubeClient {
	return &youtubeServiceImpl{
		service: NewClient(apiKey),
	}
}

// GetVideos returns a list of videos by their IDs.
func (y *youtubeServiceImpl) GetVideos(ctx context.Context, param domain_youtube.VideosParam) (model.Videos, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "YoutubeService#GetVideos")
	defer span.End()

	var videos []*youtube.Video
	videoIDChunks, err := pkg.Chunk(param.VideoIDs, 50)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to chunk video IDs")
		return nil, err
	}

	for _, chunk := range videoIDChunks {
		call := y.service.Videos.List([]string{"snippet", "liveStreamingDetails", "statistics"}).Id(strings.Join(chunk, ","))
		call = call.Context(ctx)
		response, err := call.Do()
		if err != nil {
			span.SetStatus(codes.Error, fmt.Sprintf("Error making Videos.List call: %v", err))
			return nil, err
		}
		videos = append(videos, response.Items...)
	}

	v, err := dto.YtVideosToVideos(videos)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to convert YouTube videos to model")
		return nil, err
	}

	span.SetStatus(codes.Ok, "Success")
	return v, nil
}

// Search returns a list of videos by their search query.
func (y *youtubeServiceImpl) SearchVideos(ctx context.Context, param domain_youtube.SearchVideosParam) (model.Videos, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "YoutubeService#SearchVideos")
	defer span.End()

	call := y.service.Search.List([]string{"snippet"}).
		Q(param.SearchQuery.String()).
		Type("video").
		MaxResults(50).
		EventType(param.EventType.String())
	call = call.Context(ctx)

	response, err := call.Do()
	if err != nil {
		span.SetStatus(codes.Error, fmt.Sprintf("Error making Search.List call: %v", err))
		return nil, err
	}

	videoIDs := make([]string, len(response.Items))
	for i, item := range response.Items {
		if item.Id.VideoId != "" {
			videoIDs[i] = item.Id.VideoId
		}
	}

	videos, err := y.GetVideos(ctx, domain_youtube.VideosParam{VideoIDs: videoIDs})
	if err != nil {
		span.SetStatus(codes.Error, "Failed to retrieve videos by video IDs")
		return nil, err
	}

	span.SetStatus(codes.Ok, "Success")
	return videos, nil
}

// Channels returns a list of channels by their IDs.
func (y *youtubeServiceImpl) Channels(ctx context.Context, param domain_youtube.ChannelsParam) (model.Channels, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "YoutubeService#Channels")
	defer span.End()

	call := y.service.Channels.List([]string{"snippet"}).Id(strings.Join(param.ChannelIDs, ","))
	call = call.Context(ctx)

	response, err := call.Do()
	if err != nil {
		span.SetStatus(codes.Error, fmt.Sprintf("Error making Channels.List call: %v", err))
		return nil, err
	}

	c, err := dto.YtChannelsToChannels(response)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to convert YouTube channels to model")
		return nil, err
	}

	span.SetStatus(codes.Ok, "Success")
	return c, nil
}
