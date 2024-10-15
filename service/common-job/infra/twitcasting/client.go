package twitcasting

import (
	"net/http"
	"time"

	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/environment"
	chttp "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/http"
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
	c := chttp.NewHttpClient(10 * time.Second)
	return &TwitcastingService{
		client: &Client{
			httpClient: c,
		},
		env: env,
	}
}
