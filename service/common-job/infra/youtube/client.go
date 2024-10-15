package youtube

import (
	"context"
	"log"
	"time"

	"github.com/sugar-cat7/vspo-portal/service/common-job/pkg/http"
	"google.golang.org/api/option"
	"google.golang.org/api/youtube/v3"
)

// NewClient returns a new YouTube client.
func NewClient(apiKey string) *youtube.Service {
	ctx := context.Background()
	client, err := youtube.NewService(ctx, option.WithAPIKey(apiKey), option.WithHTTPClient(http.NewHttpClient(10*time.Second)))
	if err != nil {
		log.Fatalf("Error creating new YouTube client: %v", err)
	}
	return client
}
