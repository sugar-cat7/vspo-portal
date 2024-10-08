package usecase_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	mock_twitcasting "github.com/sugar-cat7/vspo-portal/service/common-job/domain/twitcasting/mock"
	mock_twitch "github.com/sugar-cat7/vspo-portal/service/common-job/domain/twitch/mock"
	mock_youtube "github.com/sugar-cat7/vspo-portal/service/common-job/domain/youtube/mock"
	"github.com/sugar-cat7/vspo-portal/service/common-job/test/testdata"
	"github.com/sugar-cat7/vspo-portal/service/common-job/test/testhelpers"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase"
	"github.com/sugar-cat7/vspo-portal/service/common-job/usecase/input"
	"go.uber.org/mock/gomock"
)

func Test_UpdatePlatformVideos(t *testing.T) {
	type args struct {
		ctx   context.Context
		param *input.UpdatePlatformVideos
	}
	tests := []struct {
		name    string
		args    args
		setup   func(ctx context.Context, ctrl *gomock.Controller) usecase.VideoInteractor
		want    int // want is the number of videos
		wantErr bool
	}{
		{
			name: "success_new_fetch_vspo_stream_youtube_live_ and_upcoming_achieve",
			args: args{
				ctx: context.Background(),
				param: &input.UpdatePlatformVideos{
					PlatformTypes: []string{"youtube"},
					VideoType:     "vspo_stream",
				},
			},
			setup: func(ctx context.Context, ctrl *gomock.Controller) usecase.VideoInteractor {
				r := testhelpers.SetupRepo(ctx)
				yt := mock_youtube.NewMockYoutubeClient(ctrl)
				// all return 5 videos
				yt.EXPECT().SearchVideos(gomock.Any(), gomock.Any()).Return(testdata.NewVspoFactory().VspoYtVs, nil).Times(6)
				tw := mock_twitch.NewMockTwitchClient(ctrl)
				twi := mock_twitcasting.NewMockTwitcastingClient(ctrl)
				return usecase.NewVideoInteractor(r.Transactable, r.CreatorRepo, r.ChannelRepo, r.VideoRepo, yt, tw, twi)
			},
			want:    5,
			wantErr: false,
		},
		{
			name: "success_new_fetch_vspo_stream_twitch_live_ and_upcoming",
			args: args{
				ctx: context.Background(),
				param: &input.UpdatePlatformVideos{
					PlatformTypes: []string{"twitch"},
					VideoType:     "vspo_stream",
				},
			},
			setup: func(ctx context.Context, ctrl *gomock.Controller) usecase.VideoInteractor {
				r := testhelpers.SetupRepo(ctx)
				yt := mock_youtube.NewMockYoutubeClient(ctrl)
				f := testdata.NewVspoFactory()
				tw := mock_twitch.NewMockTwitchClient(ctrl)
				tw.EXPECT().GetVideos(gomock.Any(), gomock.Any()).Return(f.VspoTwitchVs, nil)
				twi := mock_twitcasting.NewMockTwitcastingClient(ctrl)
				return usecase.NewVideoInteractor(r.Transactable, r.CreatorRepo, r.ChannelRepo, r.VideoRepo, yt, tw, twi)
			},
			want:    5,
			wantErr: false,
		},
		{
			name: "success_new_fetch_vspo_stream_twitcasting_live_ and_upcoming",
			args: args{
				ctx: context.Background(),
				param: &input.UpdatePlatformVideos{
					PlatformTypes: []string{"twitcasting"},
					VideoType:     "vspo_stream",
				},
			},
			setup: func(ctx context.Context, ctrl *gomock.Controller) usecase.VideoInteractor {
				r := testhelpers.SetupRepo(ctx)
				yt := mock_youtube.NewMockYoutubeClient(ctrl)
				f := testdata.NewVspoFactory()
				tw := mock_twitch.NewMockTwitchClient(ctrl)
				twi := mock_twitcasting.NewMockTwitcastingClient(ctrl)
				twi.EXPECT().GetVideos(gomock.Any(), gomock.Any()).Return(f.VspoTwitcastingVs, nil)
				return usecase.NewVideoInteractor(r.Transactable, r.CreatorRepo, r.ChannelRepo, r.VideoRepo, yt, tw, twi)
			},
			want:    5,
			wantErr: false,
		},
		{
			name: "success_new_fetch_vspo_stream_all_live_ and_upcoming",
			args: args{
				ctx: context.Background(),
				param: &input.UpdatePlatformVideos{
					PlatformTypes: []string{"youtube", "twitch", "twitcasting"},
					VideoType:     "vspo_stream",
				},
			},
			setup: func(ctx context.Context, ctrl *gomock.Controller) usecase.VideoInteractor {
				r := testhelpers.SetupRepo(ctx)
				yt := mock_youtube.NewMockYoutubeClient(ctrl)
				f1 := testdata.NewVspoFactory()
				yt.EXPECT().SearchVideos(gomock.Any(), gomock.Any()).Return(f1.VspoYtVs, nil).Times(6)
				tw := mock_twitch.NewMockTwitchClient(ctrl)
				tw.EXPECT().GetVideos(gomock.Any(), gomock.Any()).Return(f1.VspoTwitchVs, nil)
				twi := mock_twitcasting.NewMockTwitcastingClient(ctrl)
				twi.EXPECT().GetVideos(gomock.Any(), gomock.Any()).Return(f1.VspoTwitcastingVs, nil)
				return usecase.NewVideoInteractor(r.Transactable, r.CreatorRepo, r.ChannelRepo, r.VideoRepo, yt, tw, twi)
			},
			want:    15,
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()
			i := tt.setup(tt.args.ctx, ctrl)
			v, err := i.UpdatePlatformVideos(tt.args.ctx, tt.args.param)
			if !tt.wantErr {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, v)
			} else {
				assert.Error(t, err)
			}
		})
	}
}

func Test_UpdatwExistVideos(t *testing.T) {
	type args struct {
		ctx   context.Context
		param *input.UpdateExistVideos
	}
	tests := []struct {
		name    string
		args    args
		setup   func(ctx context.Context, ctrl *gomock.Controller) usecase.VideoInteractor
		want    int // want is the number of videos
		wantErr bool
	}{
		{
			name: "success_update_exist_videos_no_diff",
			args: args{
				ctx:   context.Background(),
				param: &input.UpdateExistVideos{},
			},
			setup: func(ctx context.Context, ctrl *gomock.Controller) usecase.VideoInteractor {
				r := testhelpers.SetupRepo(ctx)
				yt := mock_youtube.NewMockYoutubeClient(ctrl)
				vs := testdata.NewYoutubeVideosWithCreator()
				err := testhelpers.CreateMockData(ctx, r.Transactable, vs)
				yt.EXPECT().GetVideos(gomock.Any(), gomock.Any()).Return(vs, nil).Times(1)
				if err != nil {
					t.Fatal(err)
				}
				tw := mock_twitch.NewMockTwitchClient(ctrl)
				twi := mock_twitcasting.NewMockTwitcastingClient(ctrl)
				return usecase.NewVideoInteractor(r.Transactable, r.CreatorRepo, r.ChannelRepo, r.VideoRepo, yt, tw, twi)
			},
			want:    0,
			wantErr: false,
		},
		{
			name: "success_update_exist_videos_diff",
			args: args{
				ctx:   context.Background(),
				param: &input.UpdateExistVideos{},
			},
			setup: func(ctx context.Context, ctrl *gomock.Controller) usecase.VideoInteractor {
				r := testhelpers.SetupRepo(ctx)
				yt := mock_youtube.NewMockYoutubeClient(ctrl)
				vs := testdata.NewYoutubeVideosWithCreator()
				err := testhelpers.CreateMockData(ctx, r.Transactable, vs)
				vs[0].Title = "updated"
				yt.EXPECT().GetVideos(gomock.Any(), gomock.Any()).Return(vs, nil).Times(1)
				if err != nil {
					t.Fatal(err)
				}
				tw := mock_twitch.NewMockTwitchClient(ctrl)
				twi := mock_twitcasting.NewMockTwitcastingClient(ctrl)
				return usecase.NewVideoInteractor(r.Transactable, r.CreatorRepo, r.ChannelRepo, r.VideoRepo, yt, tw, twi)
			},
			want:    1,
			wantErr: false,
		},
		{
			name: "success_delete_exist_videos_diff",
			args: args{
				ctx:   context.Background(),
				param: &input.UpdateExistVideos{},
			},
			setup: func(ctx context.Context, ctrl *gomock.Controller) usecase.VideoInteractor {
				r := testhelpers.SetupRepo(ctx)
				yt := mock_youtube.NewMockYoutubeClient(ctrl)
				vs := testdata.NewYoutubeVideosWithCreator()
				err := testhelpers.CreateMockData(ctx, r.Transactable, vs)
				vs = vs[1:]
				yt.EXPECT().GetVideos(gomock.Any(), gomock.Any()).Return(vs, nil).Times(1)
				if err != nil {
					t.Fatal(err)
				}
				tw := mock_twitch.NewMockTwitchClient(ctrl)
				twi := mock_twitcasting.NewMockTwitcastingClient(ctrl)
				return usecase.NewVideoInteractor(r.Transactable, r.CreatorRepo, r.ChannelRepo, r.VideoRepo, yt, tw, twi)
			},
			want:    1,
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()
			i := tt.setup(tt.args.ctx, ctrl)
			v, err := i.UpdatwExistVideos(tt.args.ctx, tt.args.param)
			if !tt.wantErr {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, v)
			} else {
				assert.Error(t, err)
			}
		})
	}
}
