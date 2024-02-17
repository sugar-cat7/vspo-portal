package environment

type Environment struct {
	DatabaseEnvironment
	TwitchEnvironment
	TwitcastingEnvironment
}

type DatabaseEnvironment struct {
	DBHost     string `env:"DB_HOST,required"`
	DBUser     string `env:"DB_USER,required"`
	DBPassword string `env:"DB_PASSWORD,required"`
	DBDatabase string `env:"DB_DATABASE,required"`
}

type TwitchEnvironment struct {
	TwitchClientID     string `env:"TWITCH_CLIENT_ID,required"`
	TwitchClientSecret string `env:"TWITCH_CLIENT_SECRET,required"`
}

type TwitcastingEnvironment struct {
	TwitcastingAccessToken string `env:"TWITCASTING_ACCESS_TOKEN,required"`
}
