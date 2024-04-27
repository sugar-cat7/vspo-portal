package youtube

import (
	"context"
	"log"

	"google.golang.org/api/option"
	"google.golang.org/api/youtube/v3"
)

// NewClient returns a new YouTube client.
func NewClient(apiKey string) *youtube.Service {
	ctx := context.Background()
	client, err := youtube.NewService(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatalf("Error creating new YouTube client: %v", err)
	}
	return client
}
