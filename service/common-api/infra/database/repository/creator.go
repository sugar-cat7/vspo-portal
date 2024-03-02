package repository

import (
	"context"

	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-api/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/internal/db"
	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/internal/dto"
)

type creator struct{}

func NewCreator() repository.Creator {
	return &creator{}
}

func (r *creator) List(
	ctx context.Context,
	query repository.ListCreatorsQuery,
) (model.Creators, error) {
	client, err := database.FromContext(ctx)
	if err != nil {
		return nil, err
	}
	res := model.Creators{}
	if query.Page.Valid && query.Limit.Valid {

		c, err := client.Queries.GetChannelsAndVideosByCreator(ctx, db_sqlc.GetChannelsAndVideosByCreatorParams{
			Offset: int32(query.Page.Uint64),
			Limit:  int32(query.Limit.Uint64),
		})
		if err != nil {
			return nil, err
		}
		res := model.Creators{}
		creatorMap := map[string]*model.Creator{}
		channelMap := map[string]model.Channels{}
		videoMap := map[string]model.Videos{}
		for _, v := range c {
			creatorMap[v.Creator.ID] = dto.CreatorToModel(&v.Creator)
			channelMap[v.Creator.ID] = append(channelMap[v.Creator.ID],
				dto.ChannelToModel(&v.Channel))
			videoMap[v.Channel.ID] = append(videoMap[v.Channel.ID],
				dto.VideoToModel(&v.Video))
		}
		for _, creator := range creatorMap {
			creator.Channels = channelMap[creator.ID]
			for _, channel := range creator.Channels {
				channel.Videos = videoMap[channel.ID]
			}
			res = append(res, creator)
		}
	}
	return res, nil
}

func (r *creator) Count(
	ctx context.Context,
	query repository.ListCreatorsQuery,
) (uint64, error) {
	// FIXME: implement
	return 0, nil
}
