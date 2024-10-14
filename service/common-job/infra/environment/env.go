package environment

type Environment struct {
	ServerEnvironment
	DatabaseEnvironment
	YoutubeEnvironment
	TwitchEnvironment
	TwitcastingEnvironment
}

type ServerEnvironment struct {
	ENV         string `env:"ENV,required" envDefault:"local"`
	LogLevel    string `env:"LOG_LEVEL,required" envDefault:"debug"`
	CRON_SECRET string `env:"CRON_SECRET,required" envDefault:"xxx"`
	DD_AGENT    string `env:"DD_AGENT,required" envDefault:"datadog-agent"`
	DD_PORT     string `env:"DD_PORT,required" envDefault:"8126"`
}

type DatabaseEnvironment struct {
	DBHost     string `env:"DB_HOST,required" envDefault:"localhost:5432"`
	DBUser     string `env:"DB_USER,required" envDefault:"user"`
	DBPassword string `env:"DB_PASSWORD,required" envDefault:"password"`
	DBDatabase string `env:"DB_DATABASE,required" envDefault:"vspo"`
	DBSSLMode  string `env:"DB_SSL_MODE,required" envDefault:"disable"`
}

type YoutubeEnvironment struct {
	YoutubeAPIKey string `env:"YOUTUBE_API_KEY,required" envDefault:"xxx"`
}

type TwitchEnvironment struct {
	TwitchClientID     string `env:"TWITCH_CLIENT_ID,required" envDefault:"xxx"`
	TwitchClientSecret string `env:"TWITCH_CLIENT_SECRET,required" envDefault:"xxx"`
}

type TwitcastingEnvironment struct {
	TwitcastingAccessToken string `env:"TWITCASTING_ACCESS_TOKEN,required" envDefault:"xxx"`
}
