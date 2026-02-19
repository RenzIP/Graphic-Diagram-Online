// Package p is the Google Cloud Functions Gen 2 entry point for GraDiOl API.
// This file MUST be at the module root (next to go.mod) for GCF to discover it.
package p

import (
	"log"
	"net/http"
	"sync"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"github.com/gofiber/fiber/v2/middleware/adaptor"

	"github.com/renzip/GraDiOl/internal/app"
)

var (
	instance *app.Instance
	once     sync.Once
)

func init() {
	functions.HTTP("GraDiOlAPI", GraDiOlAPI)
}

// GraDiOlAPI is the exported Cloud Function entry point.
func GraDiOlAPI(w http.ResponseWriter, r *http.Request) {
	once.Do(func() {
		log.Println("☁️  GraDiOl Cloud Function cold start — initializing app...")
		instance = app.New()
		log.Println("✓ GraDiOl Cloud Function ready")
	})

	handler := adaptor.FiberApp(instance.App)
	handler(w, r)
}
