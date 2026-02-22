package http

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/work-near-me/backend/internal/delivery/http/middleware"
)

type Router struct {
	engine      *gin.Engine
	authH       *AuthHandler
	jobH        *JobHandler
	appH        *ApplicationHandler
	ratingH     *RatingHandler
	jwtSecret   string
	redisClient *redis.Client
}

func NewRouter(
	authH *AuthHandler,
	jobH *JobHandler,
	appH *ApplicationHandler,
	ratingH *RatingHandler,
	jwtSecret string,
	redisClient *redis.Client,
) *Router {
	return &Router{
		authH:       authH,
		jobH:        jobH,
		appH:        appH,
		ratingH:     ratingH,
		jwtSecret:   jwtSecret,
		redisClient: redisClient,
	}
}

func (r *Router) Setup() *gin.Engine {
	engine := gin.Default()

	// CORS
	engine.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := engine.Group("/api")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			loginRateLimit := middleware.RateLimitMiddleware(r.redisClient, 5, time.Minute)
			auth.POST("/register", r.authH.Register)
			auth.POST("/login", loginRateLimit, r.authH.Login)
			auth.POST("/refresh", r.authH.Refresh)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(r.jwtSecret))
		{
			// Job routes
			jobs := protected.Group("/jobs")
			{
				jobs.POST("", middleware.RoleMiddleware("employer"), r.jobH.Create)
				jobs.GET("/nearby", r.jobH.GetNearby)
				jobs.GET("/my", r.jobH.GetMyJobs)
				jobs.GET("/assignments", middleware.RoleMiddleware("worker"), r.jobH.GetAssignments)
				jobs.GET("/:id", r.jobH.GetByID)
				jobs.PUT("/:id/assign", middleware.RoleMiddleware("employer"), r.jobH.Assign)
				jobs.PUT("/:id/complete", middleware.RoleMiddleware("employer"), r.jobH.Complete)

				// Application routes under jobs
				jobs.POST("/:id/apply", middleware.RoleMiddleware("worker"), r.appH.Apply)
				jobs.GET("/:id/applications", middleware.RoleMiddleware("employer"), r.appH.GetByJobID)
			}

			// Application management
			applications := protected.Group("/applications")
			{
				applications.PUT("/:id/accept", middleware.RoleMiddleware("employer"), r.appH.Accept)
				applications.PUT("/:id/reject", middleware.RoleMiddleware("employer"), r.appH.Reject)
			}

			// Rating routes
			protected.POST("/ratings", r.ratingH.Create)
		}
	}

	r.engine = engine
	return engine
}
