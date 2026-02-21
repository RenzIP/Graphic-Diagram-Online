package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// RateLimitConfig holds per-scope rate limit settings (requests per minute).
type RateLimitConfig struct {
	Global int // 100/min default
	Write  int // 30/min default
	Export int // 10/min default
}

// Config holds all application configuration loaded from environment variables.
type Config struct {
	// Server
	Port string
	Env  string // development | staging | production

	// MongoDB
	MongoURI      string
	MongoDatabase string

	// JWT (self-signed)
	JWTSecret string

	// OAuth — Google
	GoogleClientID     string
	GoogleClientSecret string

	// OAuth — GitHub
	GitHubClientID     string
	GitHubClientSecret string

	// Redis
	RedisURL string

	// CORS / OAuth
	FrontendURL string
	BackendURL  string // Full base URL of the backend, e.g. https://REGION.cloudfunctions.net/gradiol-api

	// Rate Limits
	RateLimits RateLimitConfig

	// Logging
	LogLevel  string // debug | info | warn | error
	LogFormat string // json | text
}

// Load reads environment variables and returns a validated Config.
// Panics if required variables are missing in production.
func Load() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		Port:               getEnv("PORT", "8080"),
		Env:                getEnv("ENV", "development"),
		MongoURI:           getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		MongoDatabase:      getEnv("MONGODB_DATABASE", "gradiol"),
		JWTSecret:          getEnv("JWT_SECRET", "dev-secret-change-me"),
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GitHubClientID:     getEnv("GITHUB_CLIENT_ID", ""),
		GitHubClientSecret: getEnv("GITHUB_CLIENT_SECRET", ""),
		RedisURL:           getEnv("REDIS_URL", "redis://localhost:6379"),
		FrontendURL:        getEnv("FRONTEND_URL", "http://localhost:5173"),
		BackendURL:         getEnv("BACKEND_URL", "http://localhost:8080"),
		RateLimits: RateLimitConfig{
			Global: getEnvInt("RATE_LIMIT_GLOBAL", 100),
			Write:  getEnvInt("RATE_LIMIT_WRITE", 30),
			Export: getEnvInt("RATE_LIMIT_EXPORT", 10),
		},
		LogLevel:  getEnv("LOG_LEVEL", "debug"),
		LogFormat: getEnv("LOG_FORMAT", "text"),
	}

	// Fail fast in production if critical config is missing
	if cfg.Env == "production" {
		if cfg.JWTSecret == "" || cfg.JWTSecret == "dev-secret-change-me" {
			log.Fatal("JWT_SECRET is required in production (and must not be the default)")
		}
		if cfg.MongoURI == "" {
			log.Fatal("MONGODB_URI is required in production")
		}
	}

	return cfg
}

// IsDevelopment returns true when running in development mode.
func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}
