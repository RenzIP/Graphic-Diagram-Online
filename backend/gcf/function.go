// Package gcf is the Google Cloud Functions entry point for GraDiOl API.
//
// Google Cloud Functions 2nd gen requires:
//   - functions.HTTP() registration in init()
//   - net/http compatible handler
//
// Since Fiber uses fasthttp (not net/http), we use gofiber/adaptor
// to bridge the Fiber app into a standard http.Handler.
//
// Deploy with:
//
//	gcloud functions deploy gradiol-api \
//	  --gen2 \
//	  --region=asia-southeast1 \
//	  --runtime=go122 \
//	  --trigger-http \
//	  --allow-unauthenticated \
//	  --entry-point=GraDiOlAPI \
//	  --source=. \
//	  --set-env-vars="DATABASE_URL=...,SUPABASE_JWT_SECRET=...,FRONTEND_URL=...,ENV=production"
package gcf

import (
	"log"
	"net/http"
	"sync"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"github.com/gofiber/fiber/v2/middleware/adaptor"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/app"
)

var (
	instance *app.Instance
	once     sync.Once
)

func init() {
	functions.HTTP("GraDiOlAPI", handleRequest)
}

// handleRequest is the Cloud Function entry point.
// It lazily initializes the Fiber app on the first request (cold start),
// then proxies all subsequent requests through Fiber via the adaptor.
func handleRequest(w http.ResponseWriter, r *http.Request) {
	once.Do(func() {
		log.Println("☁️  GraDiOl Cloud Function cold start — initializing app...")
		instance = app.New()
		log.Println("✓ GraDiOl Cloud Function ready")
	})

	// Bridge net/http → Fiber (fasthttp) using the adaptor
	handler := adaptor.FiberApp(instance.App)
	handler(w, r)
}
