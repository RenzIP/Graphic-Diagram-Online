package main

import (
	"fmt"
	"log"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/app"
)

func main() {
	// Initialize the full application (config, DB, DI, routes)
	instance := app.New()
	defer instance.Close()

	// Start server
	addr := fmt.Sprintf(":%s", instance.Cfg.Port)
	log.Printf("🚀 GraDiOl API starting on http://localhost%s", addr)
	log.Printf("   env=%s log_level=%s", instance.Cfg.Env, instance.Cfg.LogLevel)
	if err := instance.App.Listen(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
