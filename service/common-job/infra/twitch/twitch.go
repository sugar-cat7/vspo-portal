package twitch

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"

	twitch "github.com/Adeithe/go-twitch/api"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	doamin_twitch "github.com/sugar-cat7/vspo-portal/service/common-job/domain/twitch"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/twitch/internal/dto"
	chttp "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/http"
	trace "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/otel"
	"go.opentelemetry.io/otel/codes"
)

var _ doamin_twitch.TwitchClient = (*twitchServiceImpl)(nil)

type twitchServiceImpl struct {
	service *TwitchService
}

// NewService creates a new TwitchClient service implementation.
func NewService(service *TwitchService) doamin_twitch.TwitchClient {
	return &twitchServiceImpl{
		service: service,
	}
}

// getAuthToken retrieves an OAuth token from Twitch API.
func (s *twitchServiceImpl) getAuthToken(ctx context.Context) (string, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "TwitchService#getAuthToken")
	defer span.End()

	clientID := s.service.env.TwitchEnvironment.TwitchClientID
	clientSecret := s.service.env.TwitchEnvironment.TwitchClientSecret

	data := map[string]string{
		"client_id":     clientID,
		"client_secret": clientSecret,
		"grant_type":    "client_credentials",
	}

	payload, _ := json.Marshal(data)

	req, _ := http.NewRequestWithContext(ctx, "POST", "https://id.twitch.tv/oauth2/token", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")

	resp, err := chttp.NewHttpClient(10 * time.Second).Do(req)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get auth token")
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		span.SetStatus(codes.Error, "Failed to unmarshal auth token response")
		return "", err
	}

	token, ok := result["access_token"].(string)
	if !ok {
		span.SetStatus(codes.Error, "Invalid auth token response format")
		return "", err
	}

	span.SetStatus(codes.Ok, "Success")
	return token, nil
}

// getStreams retrieves live streams for the given user IDs.
func (s *twitchServiceImpl) getStreams(ctx context.Context, userIDs []string) (model.Videos, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "TwitchService#getStreams")
	defer span.End()

	token, err := s.getAuthToken(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get auth token")
		return nil, err
	}

	stream, err := s.service.client.Streams.List().UserID(userIDs).Do(ctx, twitch.WithBearerToken(token))
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get streams")
		return nil, err
	}

	span.SetStatus(codes.Ok, "Success")
	return dto.TwStreamsToVideos(stream.Data), nil
}

// GetVideos retrieves videos (past and live streams) for the given user IDs.
func (s *twitchServiceImpl) GetVideos(ctx context.Context, param doamin_twitch.TwitchVideosParam) (model.Videos, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "TwitchService#GetVideos")
	defer span.End()

	token, err := s.getAuthToken(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get auth token")
		return nil, err
	}

	var videos model.Videos
	// Retrieve past videos
	for _, userID := range param.UserIDs {
		video, err := s.service.client.Videos.List().UserID(userID).Type("archive").Do(ctx, twitch.WithBearerToken(token))
		if err != nil {
			span.SetStatus(codes.Error, "Failed to get past videos")
			return nil, err
		}
		videos = append(videos, dto.TwVideosToVideos(video.Data)...)
	}

	// Retrieve live streams
	stream, err := s.getStreams(ctx, param.UserIDs)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get live streams")
		return nil, err
	}

	videos = append(videos, stream...)
	span.SetStatus(codes.Ok, "Success")
	return videos, nil
}
