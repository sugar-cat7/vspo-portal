package twitch

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"

	twitch "github.com/Adeithe/go-twitch/api"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	doamin_twitch "github.com/sugar-cat7/vspo-portal/service/common-api/domain/twitch"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/twitch/internal/dto"
)

var _ doamin_twitch.TwitchClient = (*twitchServiceImpl)(nil)

type twitchServiceImpl struct {
	service *TwitchService
}

// NewService is ...
func NewService(service *TwitchService) doamin_twitch.TwitchClient {
	return &twitchServiceImpl{
		service: service,
	}
}

func (s *twitchServiceImpl) getAuthToken(ctx context.Context) (string, error) {
	clientID := s.service.env.TwitchEnvironment.TwitchClientID
	clientSecret := s.service.env.TwitchEnvironment.TwitchClientSecret

	data := map[string]string{
		"client_id":     clientID,
		"client_secret": clientSecret,
		"grant_type":    "client_credentials",
	}

	payload, _ := json.Marshal(data)

	req, _ := http.NewRequest("POST", "https://id.twitch.tv/oauth2/token", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result map[string]interface{}
	json.Unmarshal(body, &result)

	token := result["access_token"].(string)

	return token, nil
}

func (s *twitchServiceImpl) getStreams(ctx context.Context, userIDs []string) (model.Videos, error) {
	token, err := s.getAuthToken(ctx)
	if err != nil {
		return nil, err
	}
	stream, err := s.service.client.Streams.List().UserID(userIDs).Do(ctx, twitch.WithBearerToken(token))
	if err != nil {
		return nil, err
	}
	return dto.TwStreamsToVideos(stream.Data), nil
}

func (s *twitchServiceImpl) GetVideos(ctx context.Context, param doamin_twitch.TwitchVideosParam) (model.Videos, error) {
	token, err := s.getAuthToken(ctx)
	if err != nil {
		return nil, err
	}
	var videos model.Videos
	// Past videos
	for _, userID := range param.UserIDs {
		video, err := s.service.client.Videos.List().UserID(userID).Do(ctx, twitch.WithBearerToken(token))
		if err != nil {
			return nil, err
		}
		videos = append(videos, dto.TwVideosToVideos(video.Data)...)
	}

	// Live stream
	stream, err := s.getStreams(ctx, param.UserIDs)
	if err != nil {
		return nil, err
	}

	videos = append(videos, stream...)

	return videos, nil
}
