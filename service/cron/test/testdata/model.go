package testdata

import (
	"github.com/go-faker/faker/v4"
	"github.com/go-faker/faker/v4/pkg/options"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
)

// NewVspoFactory is  5 youtube videos, 5 twitch videos, 5 twitcasting videos
func NewVspoFactory() struct {
	Creator           model.Creator
	VspoYtVs          model.Videos // Youtube videos 5 videos
	VspoTwitchVs      model.Videos // Twitch videos 5 videos
	VspoTwitcastingVs model.Videos // Twitcasting videos 5 videos
} {
	creator := &model.Creator{}
	if err := faker.FakeData(creator); err != nil {
		panic(err)
	}

	ytVs := make(model.Videos, 5)
	if err := faker.FakeData(&ytVs, options.WithRandomMapAndSliceMaxSize(5), options.WithRandomMapAndSliceMinSize(5)); err != nil {
		panic(err)
	}

	twVs := make(model.Videos, 5)
	if err := faker.FakeData(&twVs, options.WithRandomMapAndSliceMaxSize(5), options.WithRandomMapAndSliceMinSize(5)); err != nil {
		panic(err)
	}

	twiVs := make(model.Videos, 5)
	if err := faker.FakeData(&twiVs, options.WithRandomMapAndSliceMaxSize(5), options.WithRandomMapAndSliceMinSize(5)); err != nil {
		panic(err)
	}
	creator.ID = VspoInfoMap[0].CreatorID
	creator.Channel.Youtube.ID = VspoInfoMap[0].YoutubeChannelID
	creator.Channel.Twitch.ID = VspoInfoMap[0].TwitchChannelID
	creator.Channel.TwitCasting.ID = VspoInfoMap[0].TwitcastingChannelID
	for i := 0; i < 5; i++ {
		ytVs[i].CreatorInfo.ChannelID = creator.Channel.Youtube.ID
		twVs[i].CreatorInfo.ChannelID = creator.Channel.Twitch.ID
		twiVs[i].CreatorInfo.ChannelID = creator.Channel.TwitCasting.ID
	}

	return struct {
		Creator           model.Creator
		VspoYtVs          model.Videos
		VspoTwitchVs      model.Videos
		VspoTwitcastingVs model.Videos
	}{
		Creator:           *creator,
		VspoYtVs:          ytVs,
		VspoTwitchVs:      twVs,
		VspoTwitcastingVs: twiVs,
	}
}
