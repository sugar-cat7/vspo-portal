package twitcasting

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/twitcasting"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/twitcasting/internal/dto"
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

		body, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, err
		}

		var videos []dto.TwitCastingVideo
		err = json.Unmarshal(body, &videos)
		if err != nil {
			return nil, err
		}

		movies = append(movies, dto.TwStreamsToVideos(videos)...)
	}

	return movies, nil
}
