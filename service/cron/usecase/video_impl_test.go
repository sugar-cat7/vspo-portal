package usecase_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	mock_twitcasting "github.com/sugar-cat7/vspo-portal/service/cron/domain/twitcasting/mock"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/twitch"
	mock_twitch "github.com/sugar-cat7/vspo-portal/service/cron/domain/twitch/mock"
	mock_youtube "github.com/sugar-cat7/vspo-portal/service/cron/domain/youtube/mock"
	"github.com/sugar-cat7/vspo-portal/service/cron/test/testdata"
	"github.com/sugar-cat7/vspo-portal/service/cron/test/testhelpers"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
	"go.uber.org/mock/gomock"
)

func Test_BatchDeleteInsert(t *testing.T) {
	f := testdata.NewFactory()
	type args struct {
		ctx   context.Context
		param *input.UpsertVideos
	}
	tests := []struct {
		name    string
		args    args
		setup   func(ctx context.Context, ctrl *gomock.Controller) usecase.VideoInteractor
		wantErr bool
	}{
		{
			name: "success_all_platforms",
			args: args{
				ctx: context.Background(),
				param: &input.UpsertVideos{
					VideoIDs:      []string{"id1"},
					PlatformTypes: []string{"twitch"},
					VideoType:     "vspo_broadcast",
					Period:        "period",
				},
			},
			setup: func(ctx context.Context, ctrl *gomock.Controller) usecase.VideoInteractor {
				r := testhelpers.SetupRepo(ctx)
				yt := mock_youtube.NewMockYoutubeClient(ctrl)
				// yt.EXPECT().GetVideos(ctx, gomock.Any()).Return(f.YtVs, nil)
				tw := mock_twitch.NewMockTwitchClient(ctrl)
				tw.EXPECT().GetVideos(gomock.Any(), twitch.TwitchVideosParam{
					UserIDs: []string{"id1"},
				}).Return(f.TwVs, nil)
				twi := mock_twitcasting.NewMockTwitcastingClient(ctrl)
				// twi.EXPECT().GetVideos(ctx, gomock.Any()).Return(f.TwiVs, nil)
				return usecase.NewVideoInteractor(r.Transactable, r.CreatorRepo, r.VideoRepo, yt, tw, twi)
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()
			i := tt.setup(tt.args.ctx, ctrl)
			err := i.BatchDeleteInsert(tt.args.ctx, tt.args.param)

			if tt.wantErr {
				assert.NoError(t, err)
			} else {
				assert.Error(t, err)
			}
		})
	}
}
