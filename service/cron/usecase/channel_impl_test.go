package usecase_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	mock_youtube "github.com/sugar-cat7/vspo-portal/service/cron/domain/youtube/mock"
	"github.com/sugar-cat7/vspo-portal/service/cron/test/testdata"
	"github.com/sugar-cat7/vspo-portal/service/cron/test/testhelpers"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase"
	"github.com/sugar-cat7/vspo-portal/service/cron/usecase/input"
	"go.uber.org/mock/gomock"
)

func Test_BatchUpdate(t *testing.T) {

	type args struct {
		ctx   context.Context
		param *input.BatchUpdateChannels
	}
	tests := []struct {
		name    string
		args    args
		setup   func(ctx context.Context, ctrl *gomock.Controller) usecase.ChannelInteractor
		want    int // channel count
		wantErr bool
	}{
		{
			name: "success_update_youtube_channels",
			args: args{
				ctx: context.Background(),
				param: &input.BatchUpdateChannels{
					PlatformType: "youtube",
				},
			},
			setup: func(ctx context.Context, ctrl *gomock.Controller) usecase.ChannelInteractor {
				r := testhelpers.SetupRepo(ctx)
				yt := mock_youtube.NewMockYoutubeClient(ctrl)
				f := testdata.NewVspoFactory()
				yt.EXPECT().Channels(gomock.Any(), gomock.Any()).Return(f.Creators.RetrieveChannels(), nil)
				return usecase.NewChannelInteractor(r.Transactable, r.CreatorRepo, r.ChannelRepo, yt)
			},
			want:    3,
			wantErr: false,
		},
		{
			name: "success_no_ diff_update_youtube_channels",
			args: args{
				ctx: context.Background(),
				param: &input.BatchUpdateChannels{
					PlatformType: "youtube",
				},
			},
			setup: func(ctx context.Context, ctrl *gomock.Controller) usecase.ChannelInteractor {
				r := testhelpers.SetupRepo(ctx)
				yt := mock_youtube.NewMockYoutubeClient(ctrl)
				f := testdata.NewVspoFactory()
				chs := f.Creators.RetrieveChannels()
				chs[0].Youtube.Name = "藍沢エマ / Aizawa Ema"
				chs[0].Youtube.ThumbnailURL = "https://yt3.ggpht.com/oIps6UVvqtpJykcdjYYyRvhdcyVoR1wAdH8CnTp4msMaKYdn8XMLj4FHsLoqfWaJzbLJKSPjCg=s88-c-k-c0x00ffffff-no-rj"
				yt.EXPECT().Channels(gomock.Any(), gomock.Any()).Return(f.Creators.RetrieveChannels(), nil)
				return usecase.NewChannelInteractor(r.Transactable, r.CreatorRepo, r.ChannelRepo, yt)
			},
			want:    2,
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()
			i := tt.setup(tt.args.ctx, ctrl)
			v, err := i.BatchUpdate(tt.args.ctx, tt.args.param)
			if !tt.wantErr {
				assert.NoError(t, err)
				assert.Len(t, v, tt.want)
			} else {
				assert.Error(t, err)
			}
		})
	}
}
