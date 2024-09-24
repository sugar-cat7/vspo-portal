package twitch

import (
	twitch "github.com/Adeithe/go-twitch/api"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/environment"
)

type TwitchService struct {
	client *twitch.Client
	env    *environment.Environment
}

func NewClient(env *environment.Environment) *TwitchService {
	return &TwitchService{
		client: twitch.New(env.TwitchEnvironment.TwitchClientID, twitch.WithClientSecret(env.TwitchEnvironment.TwitchClientSecret)),
		env:    env,
	}
}
