package youtube

import (
	"context"
	"fmt"
	"strings"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	domain_youtube "github.com/sugar-cat7/vspo-portal/service/common-api/domain/youtube"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/youtube/internal/dto"
	"github.com/sugar-cat7/vspo-portal/service/common-api/pkg"
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
func (y *youtubeServiceImpl) GetVideos(ctx context.Context, param domain_youtube.YoutubeVideosParam) (model.Videos, error) {
	var videos []*youtube.Video
	videoIDChunks, err := pkg.Chunk(param.VideoIDs, 50)
	if err != nil {
		return nil, err
	}
	for _, chunk := range videoIDChunks {
		call := y.service.Videos.List([]string{"snippet", "liveStreamingDetails", "statistics"}).Id(strings.Join(chunk, ","))
		response, err := call.Do()
		if err != nil {
			return nil, fmt.Errorf("error making Videos.List call: %v", err)
		}
		videos = append(videos, response.Items...)
	}
	v, err := dto.YtVideosToVideos(videos)
	if err != nil {
		return nil, err
	}
	return v, nil
}

// Search returns a list of videos by their search query.
func (y *youtubeServiceImpl) SearchVideos(ctx context.Context, param domain_youtube.YoutubeSearchVideosParam) (model.Videos, error) {
	call := y.service.Search.List([]string{"snippet", "liveStreamingDetails"}).Q(param.SearchQuery.String()).Type("video").MaxResults(50).EventType(param.EventType.String())

	response, err := call.Do()
	if err != nil {
		return nil, fmt.Errorf("error making Search.List call: %v", err)
	}
	v, err := dto.YtSearchResultToVideos(response)
	if err != nil {
		return nil, err
	}
	return v, nil
}
