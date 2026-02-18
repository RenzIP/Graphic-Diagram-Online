# GraDiOl — Backend Architecture (Go Fiber + Bun MVP)

> **Status:** Proposed — this document defines the planned backend architecture for the GraDiOl MVP. All structures, layers, and middleware described here are design targets, not yet implemented.

---

## 1. Proposed Folder Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # Entrypoint: config → DB → Fiber → routes → listen
│
├── internal/
│   ├── config/
│   │   └── config.go            # Env vars loader (Supabase, DB, Redis, port)
│   │
│   ├── middleware/
│   │   ├── auth.go              # Supabase JWT verification → ctx.Locals("userId")
│   │   ├── cors.go              # CORS policy (allowlist frontend origin)
│   │   ├── request_id.go        # X-Request-ID generation (UUID per request)
│   │   ├── rate_limit.go        # Token bucket per user (Redis-backed)
│   │   ├── logger.go            # Structured request logging (method, path, status, latency)
│   │   └── recover.go           # Panic recovery → 500 JSON response
│   │
│   ├── handler/                 # HTTP handlers (thin — parse request, call service, write response)
│   │   ├── health.go            # GET /api/health
│   │   ├── auth.go              # POST /api/auth/callback, GET /api/auth/me
│   │   ├── workspace.go         # Workspace CRUD handlers
│   │   ├── project.go           # Project CRUD handlers
│   │   ├── document.go          # Document CRUD + recent + export handlers
│   │   └── errors.go            # Shared error response helper (code → HTTP status mapping)
│   │
│   ├── service/                 # Business logic layer
│   │   ├── auth_service.go      # Token validation, profile upsert
│   │   ├── workspace_service.go # Workspace CRUD + auto-create owner membership
│   │   ├── project_service.go   # Project CRUD + workspace permission check
│   │   ├── document_service.go  # Document CRUD + version increment + autosave
│   │   └── export_service.go    # PNG/SVG export logic (server-side or delegate)
│   │
│   ├── repository/              # Data access layer (Bun ORM queries)
│   │   ├── user_repo.go         # user_profiles table queries
│   │   ├── workspace_repo.go    # workspaces + workspace_members queries
│   │   ├── project_repo.go      # projects table queries
│   │   ├── document_repo.go     # documents table queries (JSONB content/view)
│   │   └── base.go              # Shared pagination/sorting helpers
│   │
│   ├── model/                   # Bun model structs (DB ↔ Go mapping)
│   │   ├── user.go              # UserProfile struct
│   │   ├── workspace.go         # Workspace + WorkspaceMember structs
│   │   ├── project.go           # Project struct
│   │   └── document.go          # Document struct (content/view as json.RawMessage)
│   │
│   ├── dto/                     # Request/Response DTOs (API contract types)
│   │   ├── auth.go              # AuthCallbackReq, AuthMeResp
│   │   ├── workspace.go         # CreateWorkspaceReq, WorkspaceResp, WorkspaceListResp
│   │   ├── project.go           # CreateProjectReq, ProjectResp, ProjectListResp
│   │   ├── document.go          # CreateDocumentReq, UpdateDocumentReq, DocumentResp
│   │   ├── export.go            # ExportReq (format, scale, background, padding)
│   │   └── common.go            # PaginationQuery, PaginationMeta, ErrorResponse
│   │
│   ├── router/
│   │   └── router.go            # Route registration (groups, middleware binding)
│   │
│   └── pkg/                     # Internal shared utilities
│       ├── slug.go              # Workspace name → slug generator
│       ├── validator.go         # Struct validation helpers (go-playground/validator)
│       └── response.go          # JSON response helpers (success, error, paginated)
│
├── migrations/                  # SQL migration files (Bun migrate)
│   ├── 001_create_user_profiles.up.sql
│   ├── 001_create_user_profiles.down.sql
│   ├── 002_create_workspaces.up.sql
│   ├── 002_create_workspaces.down.sql
│   ├── 003_create_workspace_members.up.sql
│   ├── 003_create_workspace_members.down.sql
│   ├── 004_create_projects.up.sql
│   ├── 004_create_projects.down.sql
│   ├── 005_create_documents.up.sql
│   ├── 005_create_documents.down.sql
│   └── seed.sql                 # Minimal seed data for development
│
├── go.mod
├── go.sum
├── Dockerfile
├── .env.example                 # Environment variable template
└── Makefile                     # dev, build, migrate, seed, test commands
```

---

## 2. Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP Layer                           │
│   Fiber App → Middleware Stack → Route Groups → Handlers    │
├─────────────────────────────────────────────────────────────┤
│                       Handler Layer                         │
│   Parse request body/params/query → call Service → write    │
│   JSON response. NO business logic here.                    │
├─────────────────────────────────────────────────────────────┤
│                       Service Layer                         │
│   Business logic, authorization checks, input validation,   │
│   orchestration (e.g., create workspace + insert owner      │
│   membership in one transaction).                           │
├─────────────────────────────────────────────────────────────┤
│                      Repository Layer                       │
│   Bun ORM queries. One repo per aggregate root.             │
│   Pagination, sorting, filtering helpers.                   │
│   JSONB operations for document content/view.               │
├─────────────────────────────────────────────────────────────┤
│                      Database (PostgreSQL)                   │
│   Supabase managed. RLS policies as defense-in-depth.       │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Flow (strict top-down, no skipping)

```
Handler → Service → Repository → Bun DB
              ↓
          model/dto (shared types)
```

- **Handlers** depend on **Services** (injected via struct)
- **Services** depend on **Repositories** (injected via struct)
- **Repositories** depend on `*bun.DB` (injected via constructor)
- **No circular dependencies.** A handler never calls a repository directly.

---

## 3. Middleware Stack

Middleware will be applied in this order (outermost → innermost):

```go
// Planned middleware chain
app.Use(middleware.Recover())        // 1. Panic recovery → 500 JSON
app.Use(middleware.RequestID())      // 2. Generate X-Request-ID header
app.Use(middleware.Logger())         // 3. Structured request log (with request ID)
app.Use(middleware.CORS(cfg))        // 4. CORS (allow frontend origin)
app.Use(middleware.RateLimit(redis)) // 5. Global rate limit (100/min per IP)

api := app.Group("/api")
api.Get("/health", handler.Health)   // No auth required

// Auth-protected routes
protected := api.Group("", middleware.Auth(supabaseJWTSecret))
protected.Post("/auth/callback", ...)
protected.Get("/auth/me", ...)
// ... all other endpoints
```

### Middleware Details

| Middleware    | Responsibility                                                          | Key Config                                                                                                      |
| ------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Recover**   | Catch panics, return `{ code: "INTERNAL_ERROR", message: "..." }`       | Log stack trace with request ID                                                                                 |
| **RequestID** | Generate UUID per request, set `X-Request-ID` header and `ctx.Locals`   | UUID v4                                                                                                         |
| **Logger**    | Structured JSON log: method, path, status, latency, request ID, user ID | zerolog or slog                                                                                                 |
| **CORS**      | Allow frontend origin, handle preflight                                 | `AllowOrigins: [FRONTEND_URL]`, `AllowMethods: GET,POST,PUT,DELETE`, `AllowHeaders: Authorization,Content-Type` |
| **RateLimit** | Token bucket per user (by JWT `sub` claim)                              | Global: 100/min, Write: 30/min, Export: 10/min                                                                  |
| **Auth**      | Validate Supabase JWT signature, extract `sub` → `ctx.Locals("userId")` | `SUPABASE_JWT_SECRET` env var, HS256 algorithm                                                                  |

### Auth Middleware — JWT Validation Flow

```
Request arrives with Authorization: Bearer <token>
  │
  ├── Missing/malformed → 401 { code: "UNAUTHORIZED" }
  │
  ├── Parse JWT with SUPABASE_JWT_SECRET (HS256)
  │     ├── Invalid signature → 401
  │     ├── Expired → 401
  │     └── Valid → extract claims
  │
  ├── Set ctx.Locals("userId", claims.Sub)   // UUID from Supabase
  ├── Set ctx.Locals("email", claims.Email)
  └── c.Next()
```

---

## 4. Endpoint Implementation Plan

### 16 MVP Endpoints mapped to Handler → Service → Repository

| #   | Method | Path                           | Handler                   | Service Method                   | Repository Method                            |
| --- | ------ | ------------------------------ | ------------------------- | -------------------------------- | -------------------------------------------- |
| 1   | GET    | `/api/health`                  | `health.Check`            | —                                | —                                            |
| 2   | POST   | `/api/auth/callback`           | `auth.Callback`           | `AuthService.ExchangeToken`      | `UserRepo.Upsert`                            |
| 3   | GET    | `/api/auth/me`                 | `auth.Me`                 | `AuthService.GetProfile`         | `UserRepo.FindByID`                          |
| 4   | GET    | `/api/workspaces`              | `workspace.List`          | `WorkspaceService.ListByUser`    | `WorkspaceRepo.FindByMember`                 |
| 5   | POST   | `/api/workspaces`              | `workspace.Create`        | `WorkspaceService.Create`        | `WorkspaceRepo.Insert` + `MemberRepo.Insert` |
| 6   | PUT    | `/api/workspaces/:id`          | `workspace.Update`        | `WorkspaceService.Update`        | `WorkspaceRepo.Update`                       |
| 7   | DELETE | `/api/workspaces/:id`          | `workspace.Delete`        | `WorkspaceService.Delete`        | `WorkspaceRepo.Delete`                       |
| 8   | GET    | `/api/workspaces/:id/projects` | `project.ListByWorkspace` | `ProjectService.ListByWorkspace` | `ProjectRepo.FindByWorkspace`                |
| 9   | POST   | `/api/projects`                | `project.Create`          | `ProjectService.Create`          | `ProjectRepo.Insert`                         |
| 10  | PUT    | `/api/projects/:id`            | `project.Update`          | `ProjectService.Update`          | `ProjectRepo.Update`                         |
| 11  | DELETE | `/api/projects/:id`            | `project.Delete`          | `ProjectService.Delete`          | `ProjectRepo.Delete`                         |
| 12  | GET    | `/api/projects/:id/documents`  | `document.ListByProject`  | `DocumentService.ListByProject`  | `DocumentRepo.FindByProject`                 |
| 13  | GET    | `/api/documents/:id`           | `document.GetByID`        | `DocumentService.GetByID`        | `DocumentRepo.FindByID`                      |
| 14  | POST   | `/api/documents`               | `document.Create`         | `DocumentService.Create`         | `DocumentRepo.Insert`                        |
| 15  | PUT    | `/api/documents/:id`           | `document.Update`         | `DocumentService.Update`         | `DocumentRepo.Update`                        |
| 16  | DELETE | `/api/documents/:id`           | `document.Delete`         | `DocumentService.Delete`         | `DocumentRepo.Delete`                        |
| 17  | GET    | `/api/documents/recent`        | `document.Recent`         | `DocumentService.ListRecent`     | `DocumentRepo.FindRecent`                    |
| 18  | POST   | `/api/documents/:id/export`    | `document.Export`         | `ExportService.Export`           | `DocumentRepo.FindByID`                      |

### Authorization Matrix

| Endpoint               | Owner              | Editor    | Viewer         | No Membership        |
| ---------------------- | ------------------ | --------- | -------------- | -------------------- |
| List workspaces        | ✅ own             | ✅ member | ✅ member      | ❌                   |
| Create workspace       | ✅ (becomes owner) | —         | —              | ✅ (any authed user) |
| Update workspace       | ✅                 | ❌        | ❌             | ❌                   |
| Delete workspace       | ✅                 | ❌        | ❌             | ❌                   |
| List/Create project    | ✅                 | ✅        | ❌ (list only) | ❌                   |
| Update/Delete project  | ✅                 | ✅        | ❌             | ❌                   |
| List/Read document     | ✅                 | ✅        | ✅             | ❌                   |
| Create/Update document | ✅                 | ✅        | ❌             | ❌                   |
| Delete document        | ✅                 | ❌        | ❌             | ❌                   |
| Export document        | ✅                 | ✅        | ✅             | ❌                   |

---

## 5. Model Structs (Bun)

### Key Design Decisions

```go
// Document model — content and view stored as json.RawMessage
// This allows the backend to pass through JSONB without
// unmarshalling the full node/edge graph (performance).

type Document struct {
    bun.BaseModel `bun:"table:documents,alias:d"`

    ID          uuid.UUID        `bun:"id,pk,type:uuid,default:gen_random_uuid()"`
    ProjectID   *uuid.UUID       `bun:"project_id,type:uuid"`           // nullable
    WorkspaceID uuid.UUID        `bun:"workspace_id,type:uuid,notnull"`
    Title       string           `bun:"title,notnull,default:'Untitled'"`
    DiagramType string           `bun:"diagram_type,notnull"`
    Content     json.RawMessage  `bun:"content,type:jsonb,notnull"`     // pass-through
    View        json.RawMessage  `bun:"view,type:jsonb,notnull"`        // pass-through
    Version     int              `bun:"version,notnull,default:1"`
    CreatedBy   *uuid.UUID       `bun:"created_by,type:uuid"`
    CreatedAt   time.Time        `bun:"created_at,default:now()"`
    UpdatedAt   time.Time        `bun:"updated_at,default:now()"`
}
```

- **`json.RawMessage` for content/view:** The backend should not deserialize the full diagram graph. It's stored and retrieved as opaque JSONB. This avoids Go struct maintenance as the frontend schema evolves.
- **`*uuid.UUID` for nullable FKs:** `ProjectID` and `CreatedBy` are optional; pointer type maps to SQL NULL.
- **Bun tags:** Use `bun:"..."` for column mapping, table aliases, and defaults.

---

## 6. Migration Plan

### Migration Files (Bun Migrate)

Each migration has a `.up.sql` (apply) and `.down.sql` (rollback).

| #   | Migration                  | Tables/Objects Created                                                                                                                                                              |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 001 | `create_user_profiles`     | `user_profiles` table + Supabase trigger to auto-insert on `auth.users` creation                                                                                                    |
| 002 | `create_workspaces`        | `workspaces` table + `idx_workspaces_owner` index + unique constraint on `slug`                                                                                                     |
| 003 | `create_workspace_members` | `workspace_members` table + composite PK + role CHECK + `idx_wm_user`, `idx_wm_workspace_role` indexes                                                                              |
| 004 | `create_projects`          | `projects` table + `idx_projects_workspace` index + FK to workspaces                                                                                                                |
| 005 | `create_documents`         | `documents` table + `diagram_type` CHECK + `version >= 1` CHECK + 5 indexes (project, workspace, created_by, updated_at, type) + FK to projects (SET NULL) and workspaces (CASCADE) |

### Example Migration: `005_create_documents.up.sql`

```sql
CREATE TABLE IF NOT EXISTS documents (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID REFERENCES projects(id) ON DELETE SET NULL,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title        TEXT NOT NULL DEFAULT 'Untitled',
    diagram_type TEXT NOT NULL CHECK (diagram_type IN ('flowchart', 'erd', 'usecase')),
    content      JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
    view         JSONB NOT NULL DEFAULT '{"positions":{},"styles":{},"routing":{}}',
    version      INT NOT NULL DEFAULT 1 CHECK (version >= 1),
    created_by   UUID REFERENCES user_profiles(id),
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_project    ON documents (project_id);
CREATE INDEX idx_documents_workspace  ON documents (workspace_id);
CREATE INDEX idx_documents_created_by ON documents (created_by);
CREATE INDEX idx_documents_updated_at ON documents (updated_at DESC);
CREATE INDEX idx_documents_type       ON documents (diagram_type);
```

### Run Migrations

```bash
# Apply all pending migrations
go run cmd/migrate/main.go up

# Rollback last migration
go run cmd/migrate/main.go down

# Check migration status
go run cmd/migrate/main.go status
```

---

## 7. Seed Data (Development)

```sql
-- seed.sql: minimal data for local development

-- 1. Seed user profile (matches a Supabase test user)
INSERT INTO user_profiles (id, full_name, avatar_url) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Dev User', NULL)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed workspace
INSERT INTO workspaces (id, name, slug, owner_id, description) VALUES
    ('00000000-0000-0000-0000-000000000010', 'My Workspace', 'my-workspace',
     '00000000-0000-0000-0000-000000000001', 'Default dev workspace')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed workspace membership (owner)
INSERT INTO workspace_members (workspace_id, user_id, role) VALUES
    ('00000000-0000-0000-0000-000000000010',
     '00000000-0000-0000-0000-000000000001', 'owner')
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- 4. Seed project
INSERT INTO projects (id, workspace_id, name, description, created_by) VALUES
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010',
     'Sample Project', 'A sample project for development',
     '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed document (flowchart with starter nodes)
INSERT INTO documents (id, project_id, workspace_id, title, diagram_type, content, view, created_by) VALUES
    ('00000000-0000-0000-0000-000000000030',
     '00000000-0000-0000-0000-000000000020',
     '00000000-0000-0000-0000-000000000010',
     'Sample Flowchart',
     'flowchart',
     '{"nodes":[{"id":"1","type":"start-end","label":"Start"},{"id":"2","type":"process","label":"Step 1"}],"edges":[{"id":"e1","source":"1","target":"2"}]}',
     '{"positions":{"1":{"x":100,"y":100},"2":{"x":100,"y":250}},"styles":{},"routing":{}}',
     '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
```

---

## 8. Configuration & Environment Variables

```bash
# .env.example

# Server
PORT=8080
ENV=development           # development | staging | production

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres?sslmode=disable

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-dashboard
SUPABASE_SERVICE_KEY=your-service-role-key  # For admin operations only

# Redis (rate limiting)
REDIS_URL=redis://localhost:6379/0

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limits
RATE_LIMIT_GLOBAL=100     # requests per minute per user
RATE_LIMIT_WRITE=30       # POST/PUT/DELETE per minute
RATE_LIMIT_EXPORT=10      # export requests per minute

# Logging
LOG_LEVEL=debug           # debug | info | warn | error
LOG_FORMAT=json           # json | text (text for local dev)
```

### Config Loader Pattern

```go
// Planned: internal/config/config.go
type Config struct {
    Port              string
    Env               string
    DatabaseURL       string
    SupabaseURL       string
    SupabaseJWTSecret string
    RedisURL          string
    FrontendURL       string
    RateLimits        RateLimitConfig
    LogLevel          string
}

// Load from environment variables with sensible defaults
// Validate required fields at startup (fail fast)
```

---

## 9. Error Handling Strategy

All errors will follow the standardized error model from the API contract:

```go
// Planned: internal/handler/errors.go

type AppError struct {
    Code       string `json:"code"`
    Message    string `json:"message"`
    Details    any    `json:"details,omitempty"`
    HTTPStatus int    `json:"-"`
}

// Pre-defined errors
var (
    ErrUnauthorized  = &AppError{Code: "UNAUTHORIZED",   Message: "...", HTTPStatus: 401}
    ErrForbidden     = &AppError{Code: "FORBIDDEN",      Message: "...", HTTPStatus: 403}
    ErrNotFound      = &AppError{Code: "NOT_FOUND",      Message: "...", HTTPStatus: 404}
    ErrConflict      = &AppError{Code: "CONFLICT",       Message: "...", HTTPStatus: 409}
    ErrUnprocessable = &AppError{Code: "UNPROCESSABLE",  Message: "...", HTTPStatus: 422}
    ErrRateLimited   = &AppError{Code: "RATE_LIMITED",   Message: "...", HTTPStatus: 429}
    ErrInternal      = &AppError{Code: "INTERNAL_ERROR", Message: "...", HTTPStatus: 500}
)

// Services return AppError; handlers call a shared WriteError helper
func WriteError(c *fiber.Ctx, err *AppError) error {
    return c.Status(err.HTTPStatus).JSON(fiber.Map{"error": err})
}
```

---

## 10. Request Flow (End-to-End Example)

### `PUT /api/documents/:id` — Update Document

```
Client sends PUT /api/documents/abc-123
  Header: Authorization: Bearer <jwt>
  Body: { "title": "New Title", "content": { "nodes": [...], "edges": [...] } }
  │
  ├── middleware.Recover         → register panic handler
  ├── middleware.RequestID       → generate X-Request-ID: "req-456"
  ├── middleware.Logger          → start timer
  ├── middleware.CORS            → check origin
  ├── middleware.RateLimit       → check user token bucket (30/min write)
  ├── middleware.Auth            → validate JWT → ctx.Locals("userId", "user-789")
  │
  ├── router → document.Update handler
  │     │
  │     ├── Parse path param :id → "abc-123"
  │     ├── Parse body → UpdateDocumentReq DTO
  │     ├── Validate DTO (required fields, lengths)
  │     │
  │     └── Call DocumentService.Update(ctx, "user-789", "abc-123", dto)
  │           │
  │           ├── DocumentRepo.FindByID("abc-123")
  │           │     └── Not found? → return ErrNotFound
  │           │
  │           ├── WorkspaceRepo.GetMemberRole("user-789", doc.WorkspaceID)
  │           │     └── Role is viewer or no membership? → return ErrForbidden
  │           │
  │           ├── Apply changes: title, content, view
  │           ├── Increment version if content/view changed
  │           ├── Set updated_at = now()
  │           │
  │           └── DocumentRepo.Update(doc) → returns updated Document
  │
  │     ├── Map Document model → DocumentResp DTO
  │     └── c.Status(200).JSON(resp)
  │
  └── middleware.Logger → log: PUT /api/documents/abc-123 200 45ms req-456 user-789
```

---

## 11. Development Commands (Makefile)

```makefile
# Planned Makefile targets

dev:              # Run with hot-reload (air)
    air

build:            # Build binary
    go build -o bin/server cmd/server/main.go

test:             # Run all tests
    go test ./... -v -cover

test-integration: # Run integration tests (requires running DB)
    go test ./internal/... -tags=integration -v

migrate-up:       # Apply all pending migrations
    go run cmd/migrate/main.go up

migrate-down:     # Rollback last migration
    go run cmd/migrate/main.go down

migrate-status:   # Show migration status
    go run cmd/migrate/main.go status

seed:             # Load seed data
    psql $(DATABASE_URL) -f migrations/seed.sql

lint:             # Run linter
    golangci-lint run ./...

docker-build:     # Build Docker image
    docker build -t gradiol-backend .

docker-run:       # Run Docker container
    docker run --env-file .env -p 8080:8080 gradiol-backend
```
