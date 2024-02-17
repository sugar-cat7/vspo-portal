package twitcasting

import (
	"net/http"

	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/environment"
)

type TwitcastingService struct {
	client *Client
	env    *environment.Environment
}

// Client is twitcasting client.
type Client struct {
	httpClient *http.Client
	env        *environment.Environment
}

// NewClient is ...
func NewClient(env *environment.Environment) *Client {
	c := http.DefaultClient
	return &Client{
		httpClient: c,
		env:        env,
	}
}
