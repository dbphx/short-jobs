package config

import (
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	App      AppConfig
}

type ServerConfig struct {
	Port    string
	GinMode string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type JWTConfig struct {
	Secret        string
	AccessExpiry  time.Duration
	RefreshExpiry time.Duration
}

type AppConfig struct {
	MaxSearchRadiusKM float64
}

func (d DatabaseConfig) DSN() string {
	return "host=" + d.Host +
		" port=" + d.Port +
		" user=" + d.User +
		" password=" + d.Password +
		" dbname=" + d.DBName +
		" sslmode=" + d.SSLMode
}

func Load() (*Config, error) {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	// Set defaults
	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("GIN_MODE", "debug")
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_SSLMODE", "disable")
	viper.SetDefault("REDIS_HOST", "localhost")
	viper.SetDefault("REDIS_PORT", "6379")
	viper.SetDefault("REDIS_DB", 0)
	viper.SetDefault("JWT_ACCESS_EXPIRY", "15m")
	viper.SetDefault("JWT_REFRESH_EXPIRY", "168h")
	viper.SetDefault("MAX_SEARCH_RADIUS_KM", 5.0)

	_ = viper.ReadInConfig() // ignore error if .env not found, rely on env vars

	accessExpiry, err := time.ParseDuration(viper.GetString("JWT_ACCESS_EXPIRY"))
	if err != nil {
		accessExpiry = 15 * time.Minute
	}

	refreshExpiry, err := time.ParseDuration(viper.GetString("JWT_REFRESH_EXPIRY"))
	if err != nil {
		refreshExpiry = 7 * 24 * time.Hour
	}

	cfg := &Config{
		Server: ServerConfig{
			Port:    viper.GetString("SERVER_PORT"),
			GinMode: viper.GetString("GIN_MODE"),
		},
		Database: DatabaseConfig{
			Host:     viper.GetString("DB_HOST"),
			Port:     viper.GetString("DB_PORT"),
			User:     viper.GetString("DB_USER"),
			Password: viper.GetString("DB_PASSWORD"),
			DBName:   viper.GetString("DB_NAME"),
			SSLMode:  viper.GetString("DB_SSLMODE"),
		},
		Redis: RedisConfig{
			Host:     viper.GetString("REDIS_HOST"),
			Port:     viper.GetString("REDIS_PORT"),
			Password: viper.GetString("REDIS_PASSWORD"),
			DB:       viper.GetInt("REDIS_DB"),
		},
		JWT: JWTConfig{
			Secret:        viper.GetString("JWT_SECRET"),
			AccessExpiry:  accessExpiry,
			RefreshExpiry: refreshExpiry,
		},
		App: AppConfig{
			MaxSearchRadiusKM: viper.GetFloat64("MAX_SEARCH_RADIUS_KM"),
		},
	}

	return cfg, nil
}
