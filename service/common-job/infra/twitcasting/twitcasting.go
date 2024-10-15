package twitcasting

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/twitcasting"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/twitcasting/internal/dto"
	trace "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/otel"
	"go.opentelemetry.io/otel/codes"
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
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "TwitcastingService#GetVideos")
	defer span.End()

	movies := make(model.Videos, 0)

	for _, userID := range param.UserIDs {
		request, _ := http.NewRequestWithContext(ctx, "GET", fmt.Sprintf("https://apiv2.twitcasting.tv/users/%s/movies?limit=3", userID), nil)
		request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.service.env.TwitcastingEnvironment.TwitcastingAccessToken))

		res, err := s.service.client.httpClient.Do(request)
		if err != nil {
			span.SetStatus(codes.Error, fmt.Sprintf("Failed to execute request for user %s", userID))
			return nil, err
		}
		defer res.Body.Close()

		if res.StatusCode != http.StatusOK {
			errMsg := fmt.Sprintf("Failed to get videos from TwitCasting: %d", res.StatusCode)
			span.SetStatus(codes.Error, errMsg)
			return nil, errors.New(errMsg)
		}

		body, err := io.ReadAll(res.Body)
		if err != nil {
			span.SetStatus(codes.Error, "Failed to read response body")
			return nil, err
		}

		var rawData map[string]interface{}
		err = json.Unmarshal(body, &rawData)
		if err != nil {
			span.SetStatus(codes.Error, "Failed to unmarshal response body")
			return nil, err
		}

		moviesData, ok := rawData["movies"].([]interface{})
		if !ok {
			span.SetStatus(codes.Error, "Invalid response format: missing 'movies'")
			return nil, errors.New("invalid response format: missing movies")
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

	span.SetStatus(codes.Ok, "Success")
	return movies, nil
}
