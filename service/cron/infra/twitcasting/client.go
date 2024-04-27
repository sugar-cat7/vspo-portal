package twitcasting

import (
	"net/http"

	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/environment"
)

// TwitcastingService is ...
type TwitcastingService struct {
	client *Client
	env    *environment.Environment
}

// Client is twitcasting client.
type Client struct {
	httpClient *http.Client
}

// NewClient is ...
func NewClient(env *environment.Environment) *TwitcastingService {
	c := http.DefaultClient
	return &TwitcastingService{
		client: &Client{
			httpClient: c,
		},
		env: env,
	}
}
