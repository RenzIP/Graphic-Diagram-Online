# GraDiOl — Deployment Guide

> **Status:** Proposed — step-by-step deployment procedures for the GraDiOl MVP.

---

## 1. GCP Setup (Backend)

### 1.1 Project & Region

```bash
# Create or select project
gcloud projects create gradiol-prod --name="GraDiOl"
gcloud config set project gradiol-prod

# Set region (closest to target users)
gcloud config set functions/region asia-southeast2
```

### 1.2 Enable Required APIs

```bash
gcloud services enable \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com
```

### 1.3 Service Account (for GitHub Actions)

```bash
# Create SA
gcloud iam service-accounts create gradiol-deployer \
  --display-name="GraDiOl CI/CD Deployer"

# Grant minimal permissions
SA=gradiol-deployer@gradiol-prod.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding gradiol-prod \
  --member="serviceAccount:$SA" \
  --role="roles/cloudfunctions.developer"

gcloud projects add-iam-policy-binding gradiol-prod \
  --member="serviceAccount:$SA" \
  --role="roles/iam.serviceAccountUser"

# Generate key (for GCP_SA_KEY secret)
gcloud iam service-accounts keys create sa-key.json \
  --iam-account=$SA
# → Base64-encode and store as GitHub secret GCP_SA_KEY
```

### 1.4 Workload Identity Federation (Recommended Alternative)

```bash
# Create WIF pool
gcloud iam workload-identity-pools create "github-pool" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Allow SA impersonation from your repo
gcloud iam service-accounts add-iam-policy-binding $SA \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/YOUR_ORG/GraDiOl"
```

Store these as GitHub secrets:

- `GCP_WIF_PROVIDER` → full provider resource name
- `GCP_WIF_SERVICE_ACCOUNT` → SA email

---

## 2. Backend Structure for Cloud Functions

### 2.1 Entrypoint

Cloud Functions Gen 2 requires a single HTTP handler function as entrypoint:

```
apps/api/
├── function.go        # ★ Entrypoint: exports Handler(w, r)
├── cmd/server/main.go # Local dev: starts Fiber on PORT
├── internal/...       # All business logic
├── go.mod
└── .gcloudignore
```

```go
// function.go — Cloud Functions entrypoint
package api

import (
    "net/http"
    "github.com/gofiber/fiber/v2/adapters/cloud"
    // import your Fiber app setup
)

// Handler is the Cloud Functions entrypoint
func Handler(w http.ResponseWriter, r *http.Request) {
    app := setupApp() // returns configured *fiber.App
    cloud.HTTPHandler(app)(w, r)
}
```

### 2.2 Environment Variables (Cloud Functions)

Set via deploy command or GCP Console:

| Variable              | Example                      | Required             |
| --------------------- | ---------------------------- | -------------------- |
| `ENV`                 | `production`                 | ✅                   |
| `DATABASE_URL`        | `postgresql://...`           | ✅                   |
| `SUPABASE_JWT_SECRET` | `your-jwt-secret`            | ✅                   |
| `SUPABASE_URL`        | `https://xxx.supabase.co`    | ✅                   |
| `FRONTEND_URL`        | `https://gradiol.vercel.app` | ✅                   |
| `REDIS_URL`           | `redis://...`                | ⬡ (optional for MVP) |

```bash
# Set env vars during deploy
gcloud functions deploy gradiol-api \
  --gen2 \
  --runtime=go122 \
  --region=asia-southeast2 \
  --source=./apps/api \
  --entry-point=Handler \
  --trigger-http \
  --allow-unauthenticated \
  --memory=256Mi \
  --timeout=60s \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="ENV=production,FRONTEND_URL=https://gradiol.vercel.app" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,SUPABASE_JWT_SECRET=SUPABASE_JWT_SECRET:latest"
```

### 2.3 Local Dev

```bash
cd apps/api
cp .env.example .env   # Fill in local values
go run cmd/server/main.go
# Fiber starts on http://localhost:8080
```

### 2.4 `.gcloudignore`

```
.git
.env
.env.*
cmd/
*_test.go
testdata/
README.md
Makefile
Dockerfile
```

---

## 3. Vercel Setup (Frontend)

### 3.1 Project Setup

```bash
cd apps/web
npx vercel link
# → Select or create project
# → Framework: SvelteKit
# → Root directory: apps/web (if monorepo)
```

### 3.2 Build Settings

| Setting          | Value                         |
| ---------------- | ----------------------------- |
| Framework Preset | SvelteKit                     |
| Root Directory   | `apps/web`                    |
| Build Command    | `npm run build`               |
| Output Directory | `.svelte-kit` (auto-detected) |
| Install Command  | `npm ci`                      |
| Node.js Version  | 20.x                          |

### 3.3 Environment Variables (Vercel Dashboard)

| Variable                   | Scope               | Value                                                                 |
| -------------------------- | ------------------- | --------------------------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`      | Production, Preview | `https://xxx.supabase.co`                                             |
| `PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Supabase anon key                                                     |
| `PUBLIC_API_URL`           | Production          | `https://asia-southeast2-gradiol-prod.cloudfunctions.net/gradiol-api` |
| `PUBLIC_API_URL`           | Preview             | `https://asia-southeast2-gradiol-prod.cloudfunctions.net/gradiol-api` |

### 3.4 Adapter

SvelteKit must use `@sveltejs/adapter-vercel`:

```js
// svelte.config.js
import adapter from "@sveltejs/adapter-vercel";

export default {
  kit: {
    adapter: adapter({
      runtime: "nodejs20.x",
      regions: ["sin1"], // Singapore (closest to asia-southeast2)
    }),
  },
};
```

---

## 4. GitHub Actions Secrets

### Required Secrets (repo → Settings → Secrets)

| Secret              | Source                                     | Used By                  |
| ------------------- | ------------------------------------------ | ------------------------ |
| `GCP_PROJECT_ID`    | GCP Console → Project ID                   | `deploy.yml`             |
| `GCP_REGION`        | e.g. `asia-southeast2`                     | `deploy.yml`             |
| `GCP_SA_KEY`        | Base64 of `sa-key.json`                    | `deploy.yml` (auth step) |
| `VERCEL_TOKEN`      | Vercel → Settings → Tokens                 | `deploy.yml`             |
| `VERCEL_ORG_ID`     | `.vercel/project.json` after `vercel link` | `deploy.yml`             |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` after `vercel link` | `deploy.yml`             |

### Optional (WIF instead of SA key)

| Secret                    | Source                                                      |
| ------------------------- | ----------------------------------------------------------- |
| `GCP_WIF_PROVIDER`        | `gcloud iam workload-identity-pools providers describe ...` |
| `GCP_WIF_SERVICE_ACCOUNT` | SA email                                                    |

### How to Set

```bash
# Using GitHub CLI
gh secret set GCP_PROJECT_ID --body "gradiol-prod"
gh secret set GCP_REGION --body "asia-southeast2"
gh secret set GCP_SA_KEY < sa-key.json
gh secret set VERCEL_TOKEN --body "your-vercel-token"
gh secret set VERCEL_ORG_ID --body "team_xxxx"
gh secret set VERCEL_PROJECT_ID --body "prj_xxxx"
```

---

## 5. Rollback Strategy

### Backend (Cloud Functions)

```bash
# List recent versions
gcloud functions describe gradiol-api --gen2 --region=asia-southeast2

# Rollback: redeploy previous commit
git checkout <previous-commit>
gcloud functions deploy gradiol-api --gen2 --source=./apps/api ...

# Or redeploy from GitHub Actions:
# Re-run the last successful deploy workflow
```

| Trigger                        | Action                           |
| ------------------------------ | -------------------------------- |
| Health check fails             | Redeploy previous commit         |
| Error rate > 5% in first 5 min | Redeploy previous commit         |
| Performance > 50% degraded     | Investigate → rollback if needed |
| Minor bug                      | Fix forward (new deploy)         |

### Frontend (Vercel)

```bash
# Instant rollback via Vercel Dashboard:
# Deployments → find last stable → "..." → Promote to Production

# Or via CLI:
vercel rollback --token=$VERCEL_TOKEN
```

Vercel keeps all previous deployments immutable → rollback is instant (DNS switch).

---

## 6. Smoke Test Endpoints

### Backend Smoke Test

```bash
# Health check (no auth required)
curl -s https://asia-southeast2-gradiol-prod.cloudfunctions.net/gradiol-api/api/health

# Expected: { "status": "ok", "timestamp": "..." }
```

```bash
# Auth check (requires valid JWT)
curl -s -H "Authorization: Bearer $TOKEN" \
  https://asia-southeast2-gradiol-prod.cloudfunctions.net/gradiol-api/api/auth/me

# Expected: 200 with user profile
```

### Frontend Smoke Test

```bash
# Page loads
curl -s -o /dev/null -w "%{http_code}" https://gradiol.vercel.app
# Expected: 200

# Check meta tags
curl -s https://gradiol.vercel.app | grep -o '<title>.*</title>'
```

### Post-Deploy Verification Checklist

```
□ GET /api/health returns 200
□ Frontend loads (200, no blank page)
□ Login flow works (Supabase OAuth redirect + callback)
□ Create workspace → returns 201
□ Create document → returns 201
□ Open editor → canvas renders
□ Save document → PUT returns 200
□ Error logs clean (no new exceptions in first 5 min)
```

---

## 7. Deployment Timeline

| Phase       | Duration   | What                                        |
| ----------- | ---------- | ------------------------------------------- |
| **Prepare** | Pre-deploy | CI passes, secrets verified, team notified  |
| **Deploy**  | ~3 min     | GH Actions runs (CI gate → parallel deploy) |
| **Verify**  | 5 min      | Run smoke tests, check logs                 |
| **Monitor** | 15 min     | Watch error rate, latency dashboards        |
| **Confirm** | 1 hour     | Final check, close deploy ticket            |
