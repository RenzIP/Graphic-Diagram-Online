package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/renzip/GraDiOl/internal/config"
	"github.com/renzip/GraDiOl/internal/db"
	"github.com/renzip/GraDiOl/internal/domain/document"
	handler "github.com/renzip/GraDiOl/internal/http"
	"github.com/renzip/GraDiOl/internal/ws"
)

func main() {
	// Load config
	cfg := config.Load()

	// Connect to database
	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()
	log.Println("✓ Connected to PostgreSQL")

	// Redis is optional for now — WebSocket hub handles locks in-memory
	// Uncomment when Redis is available:
	// redisClient, err := redis.Connect(cfg.RedisURL)
	// if err != nil {
	//     log.Printf("⚠ Redis not available: %v (continuing without Redis)", err)
	// } else {
	//     log.Println("✓ Connected to Redis")
	//     defer redisClient.Close()
	// }

	// Domain layer
	repo := document.NewRepository(database)
	svc := document.NewService(repo)

	// WebSocket hub
	hub := ws.NewHub()

	// Fiber app
	app := fiber.New(fiber.Config{
		AppName: "GraDiOl API",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.CORSOrigins,
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Content-Type,Authorization",
	}))

	// Register routes
	handler.RegisterRoutes(app, svc, hub)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 GraDiOl API starting on http://localhost%s", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
