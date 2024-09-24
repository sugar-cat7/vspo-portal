package testdata

import (
	"github.com/go-faker/faker/v4"
	"github.com/go-faker/faker/v4/pkg/options"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
)

// NewVspoFactory is 3 creators, 5 youtube videos, 5 twitch videos, 5 twitcasting videos
func NewVspoFactory() struct {
	Creators          model.Creators // 3 creators
	VspoYtVs          model.Videos   // Youtube videos 5 videos
	VspoTwitchVs      model.Videos   // Twitch videos 5 videos
	VspoTwitcastingVs model.Videos   // Twitcasting videos 5 videos
} {
	creators := make(model.Creators, 3)
	if err := faker.FakeData(&creators, options.WithRandomMapAndSliceMaxSize(3), options.WithRandomMapAndSliceMinSize(3)); err != nil {
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
	for i := 0; i < 3; i++ {
		creators[i].ID = VspoInfoMap[i].CreatorID
		creators[i].Channel.Youtube.ID = VspoInfoMap[i].YoutubeChannelID
		creators[i].Channel.Twitch.ID = VspoInfoMap[i].TwitchChannelID
		creators[i].Channel.TwitCasting.ID = VspoInfoMap[i].TwitcastingChannelID
		creators[i].Channel.Youtube.IsDeleted = false
	}
	for i := 0; i < 5; i++ {
		c := creators[i%2]
		ytVs[i].CreatorInfo = model.CreatorInfo{
			ID:        c.ID,
			ChannelID: c.Channel.Youtube.ID,
		}
		twVs[i].CreatorInfo = model.CreatorInfo{
			ID:        c.ID,
			ChannelID: c.Channel.Twitch.ID,
		}
		twiVs[i].CreatorInfo = model.CreatorInfo{
			ID:        c.ID,
			ChannelID: c.Channel.TwitCasting.ID,
		}
	}

	return struct {
		Creators          model.Creators
		VspoYtVs          model.Videos
		VspoTwitchVs      model.Videos
		VspoTwitcastingVs model.Videos
	}{
		Creators:          creators,
		VspoYtVs:          ytVs,
		VspoTwitchVs:      twVs,
		VspoTwitcastingVs: twiVs,
	}
}
