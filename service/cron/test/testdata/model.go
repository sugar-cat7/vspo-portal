package testdata

import (
	"github.com/go-faker/faker/v4"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
)

func NewFactory() struct {
	Creators model.Creators
	YtVs     model.Videos
	TwVs     model.Videos
	TwiVs    model.Videos
} {
	creators := &model.Creators{}
	if err := faker.FakeData(creators); err != nil {
		panic(err)
	}
	ytVs := &model.Videos{}
	if err := faker.FakeData(ytVs); err != nil {
		panic(err)
	}
	twVs := &model.Videos{}
	if err := faker.FakeData(twVs); err != nil {
		panic(err)
	}
	twiVs := &model.Videos{}
	if err := faker.FakeData(twiVs); err != nil {
		panic(err)
	}
	return struct {
		Creators model.Creators
		YtVs     model.Videos
		TwVs     model.Videos
		TwiVs    model.Videos
	}{
		Creators: *creators,
		YtVs:     *ytVs,
		TwVs:     *twVs,
		TwiVs:    *twiVs,
	}
}
