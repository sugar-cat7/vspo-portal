package twitcasting

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/twitcasting"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/twitcasting/internal/dto"
)

var _ twitcasting.TwitcastingClient = (*twitcastingServiceImpl)(nil)

type twitcastingServiceImpl struct {
	service *TwitcastingService
}

// NewService ...
func NewService(service *TwitcastingService) twitcasting.TwitcastingClient {
	return &twitcastingServiceImpl{
		service: service,
	}
}

// GetVideos ...
func (s *twitcastingServiceImpl) GetVideos(ctx context.Context, param twitcasting.TwitcastingVideosParam) (model.Videos, error) {
	movies := make(model.Videos, 0)

	for _, userID := range param.UserIDs {
		request, _ := http.NewRequest("GET", fmt.Sprintf("https://apiv2.twitcasting.tv/users/%s/movies?limit=3", userID), nil)
		request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.service.env.TwitcastingEnvironment.TwitcastingAccessToken))
		res, err := s.service.client.httpClient.Do(request)
		if err != nil {
			return nil, err
		}
		defer res.Body.Close()

		if res.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("Failed to get videos from TwitCasting: %d", res.StatusCode)
		}

		body, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, err
		}

		var rawData map[string]interface{}
		err = json.Unmarshal(body, &rawData)
		if err != nil {
			return nil, err
		}

		moviesData, ok := rawData["movies"].([]interface{})
		if !ok {
			return nil, err
		}

		var videos []dto.TwitCastingVideo
		for _, movie := range moviesData {
			movieMap := movie.(map[string]interface{})
			video := dto.TwitCastingVideo{
				ID:           movieMap["id"].(string),
				UserID:       movieMap["user_id"].(string),
				Title:        movieMap["title"].(string),
				IsLive:       movieMap["is_live"].(bool),
				ViewCount:    int(movieMap["total_view_count"].(float64)),
				ThumbnailURL: movieMap["large_thumbnail"].(string),
				StartedAt:    int(movieMap["created"].(float64)),
			}
			videos = append(videos, video)
		}

		movies = append(movies, dto.TwStreamsToVideos(videos)...)
	}

	return movies, nil
}
