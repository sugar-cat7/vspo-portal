package usecase

import (
	"context"
	"sync"

	"github.com/samber/lo"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/youtube"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
	"github.com/volatiletech/null/v8"
)

type channelInteractor struct {
	transactable      repository.Transactable
	creatorRepository repository.Creator
	channelRepository repository.Channel
	youtubeClient     youtube.YoutubeClient
}

// NewChannelInteractor creates a new ChannelInteractor
func NewChannelInteractor(
	transactable repository.Transactable,
	creatorRepository repository.Creator,
	channelRepository repository.Channel,
	youtubeClient youtube.YoutubeClient,
) ChannelInteractor {
	return &channelInteractor{
		transactable,
		creatorRepository,
		channelRepository,
		youtubeClient,
	}
}

func (i *channelInteractor) BatchUpdate(
	ctx context.Context,
	param *input.BatchUpdateChannels,
) (model.Channels, error) {
	var diffChs model.Channels
	err := i.transactable.RWTx(
		ctx,
		func(ctx context.Context) error {
			chs, err := i.channelRepository.List(ctx, repository.ListChannelQuery{
				PlatformType: param.PlatformType,
				BaseListOptions: repository.BaseListOptions{
					Limit: null.NewUint64(1000, true),
					Page:  null.NewUint64(0, true),
				},
			})
			if err != nil {
				return err
			}

			batches := [][]string{}
			for i := 0; i < len(chs); i += 50 {
				end := i + 50
				if end > len(chs) {
					end = len(chs)
				}
				idsBatch := lo.Map(chs[i:end], func(ch *model.Channel, _ int) string {
					return ch.Youtube.ID
				})
				batches = append(batches, idsBatch)
			}

			var wg sync.WaitGroup
			var mu sync.Mutex
			errCh := make(chan error, 1)

			for _, idsBatch := range batches {
				wg.Add(1)
				go func(ids []string) {
					defer wg.Done()
					ytChs, err := i.youtubeClient.Channels(ctx, youtube.ChannelsParam{
						ChannelIDs: ids,
					})
					if err != nil {
						select {
						case errCh <- err:
						default:
						}
						return
					}

					mu.Lock()
					defer mu.Unlock()
					diffChs = append(diffChs, ytChs...)
				}(idsBatch)
			}

			wg.Wait()
			close(errCh)
			if err := <-errCh; err != nil {
				return err
			}
			diffChs = diffChs.FilterUpdateTarget(chs)
			// BatchUpdate
			for _, ch := range diffChs {
				_, err = i.channelRepository.Update(ctx, ch)
				if err != nil {
					return err
				}
			}
			return nil
		})

	if err != nil {
		return nil, err
	}
	return diffChs, nil
}
