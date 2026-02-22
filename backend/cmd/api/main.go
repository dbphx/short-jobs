package main

import (
	"context"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/work-near-me/backend/config"
	"github.com/work-near-me/backend/internal/delivery/http"
	"github.com/work-near-me/backend/internal/domain"
	"github.com/work-near-me/backend/internal/repository"
	"github.com/work-near-me/backend/internal/usecase"
)

func main() {
	// Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Set Gin mode
	gin.SetMode(cfg.Server.GinMode)

	// Connect to PostgreSQL
	db, err := gorm.Open(postgres.Open(cfg.Database.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Connected to PostgreSQL")

	// Auto-migrate
	if err := db.AutoMigrate(
		&domain.User{},
		&domain.Job{},
		&domain.Application{},
		&domain.Rating{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migrated")

	// Create location index
	db.Exec("CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(latitude, longitude)")

	// Connect to Redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Printf("Warning: Redis connection failed: %v (rate limiting will be unavailable)", err)
	} else {
		log.Println("Connected to Redis")
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	jobRepo := repository.NewJobRepository(db)
	appRepo := repository.NewApplicationRepository(db)
	ratingRepo := repository.NewRatingRepository(db)

	// Initialize use cases
	authUC := usecase.NewAuthUseCase(userRepo, cfg)
	jobUC := usecase.NewJobUseCase(jobRepo, ratingRepo, cfg)
	appUC := usecase.NewApplicationUseCase(appRepo, jobRepo)
	ratingUC := usecase.NewRatingUseCase(ratingRepo, userRepo, jobRepo)

	// Initialize handlers
	authH := http.NewAuthHandler(authUC)
	jobH := http.NewJobHandler(jobUC)
	appH := http.NewApplicationHandler(appUC)
	ratingH := http.NewRatingHandler(ratingUC)

	// Setup router
	router := http.NewRouter(authH, jobH, appH, ratingH, cfg.JWT.Secret, rdb)
	engine := router.Setup()

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := engine.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
