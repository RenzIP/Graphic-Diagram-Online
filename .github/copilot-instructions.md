# GraDiOl — Copilot Instructions

## Project Overview

GraDiOl (Graphic Diagram Online) is a hybrid diagram editor: bidirectional DSL text ↔ SVG visual canvas. Supports Flowchart, ERD, and Use Case diagrams.

- **Frontend:** SvelteKit 2 + Svelte 5 + TypeScript + TailwindCSS v4 — in `frontend/`
- **Backend:** Go 1.25 + Fiber v2 + Bun ORM + PostgreSQL (Supabase) — in `backend/`
- **Auth:** Supabase Auth (Google OAuth + Magic Link), JWT-based
- **Deploy:** Frontend → Vercel, Backend → Google Cloud Functions (Gen 2)

## Architecture

### Data Model (5 MVP tables)
`user_profiles → workspaces → workspace_members → projects → documents`

Documents store diagram data in two JSONB columns:
- `content`: semantic model `{ nodes: [{id, type, label, properties}], edges: [{id, source, target, label, type}] }`
- `view`: visual overrides `{ positions: {nodeId: {x,y}}, styles: {nodeId: {...}}, routing: {edgeId: {...}} }`

### Frontend Architecture
- **Stores** (`lib/stores/`): `documentStore` (nodes/edges), `canvasStore` (pan/zoom/connecting), `selectionStore` (selected IDs), `historyStore` (undo/redo stack, max 50)
- **Store mutation rule:** Always call `historyStore.push(currentState)` BEFORE mutating `documentStore`
- **DSL engine** (`lib/dsl/`): `parser.ts` (text→AST) → `transformer.ts` (AST→DocumentState) → `serializer.ts` (DocumentState→text)
- **DSL sync guard:** Use `syncDirection: 'dsl' | 'canvas' | null` flag to prevent infinite loops between DslEditor and Canvas
- **API client** (`lib/api/client.ts`): base fetch wrapper with `ApiError` class, auto-attaches `Authorization: Bearer` header
- **Legacy warning:** `lib/utils/api.ts` is a legacy API wrapper; new code should use `lib/api/client.ts`
- **Coordinate math:** Use `screenToSVG()`/`svgToScreen()` from `lib/utils/geometry.ts` for mouse→canvas coordinate conversion
- **Node shapes config:** `lib/utils/constants.ts` → `NODE_SHAPES` object maps diagram types to available shapes
- **Export:** `lib/utils/export.ts` handles PNG/SVG/WebP/JPG client-side export via SVG clone + Canvas API

### Backend Architecture (layered, strict top-down)
`Handler → Service → Repository → Bun DB` (no skipping layers)
- Handlers: parse request, call service, write JSON response. No business logic.
- Services: business logic, auth checks, transactions
- Repositories: Bun ORM queries, one per aggregate root
- Auth middleware extracts JWT `sub` claim → `ctx.Locals("userId")`

## Commands

```bash
# Frontend
cd frontend && npm run dev       # Dev server on :5173
cd frontend && npm run build     # Production build
cd frontend && npm run check     # svelte-check type checking
cd frontend && npm run lint      # ESLint + Prettier check

# Backend
cd backend && go run cmd/api/main.go   # Dev server on :8080
cd backend && go build ./...           # Build check
cd backend && go test ./...            # Run tests
```

## Conventions

- **Import paths:** Always use `$lib/...` aliases, never relative `../../`
- **API contract:** All endpoints defined in `docs/spec/03-api-contract.json` — responses use `{ data: [...], meta: { page, per_page, total, total_pages } }` for lists
- **Error responses:** `{ code: "NOT_FOUND", message: "..." }` — codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `UNPROCESSABLE`, `RATE_LIMITED`, `INTERNAL_ERROR`
- **Env vars (frontend):** Prefix with `VITE_` for client-side (e.g. `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- **Diagram types (MVP):** Only `'flowchart' | 'erd' | 'usecase'` — validated by backend CHECK constraint
- **Node types:** See `NodeType` in `lib/stores/document.ts` — `'process' | 'decision' | 'start-end' | 'entity' | 'actor' | ...`
- **Svelte 5:** Uses `$state()`, `$effect()`, `$props()` runes syntax — not legacy `let` reactivity
- **Component naming:** PascalCase `.svelte` files grouped by domain (`canvas/`, `nodes/`, `edges/`, `editor/`, `ui/`)
- **Backend Go:** Domain-driven structure in `internal/domain/{entity}/` with `model.go`, `repo.go`, `service.go`

## Key Files

| Purpose | Path |
|---------|------|
| Frontend entry point | `frontend/src/routes/(app)/editor/[id]/+page.svelte` |
| Document store (source of truth) | `frontend/src/lib/stores/document.ts` |
| Canvas component | `frontend/src/lib/components/canvas/Canvas.svelte` |
| API base client | `frontend/src/lib/api/client.ts` |
| DSL parser | `frontend/src/lib/dsl/parser.ts` |
| Shape definitions | `frontend/src/lib/utils/constants.ts` |
| Geometry helpers | `frontend/src/lib/utils/geometry.ts` |
| Export engine | `frontend/src/lib/utils/export.ts` |
| Backend main | `backend/cmd/api/main.go` |
| API routes | `backend/internal/http/routes.go` |
| Spec documents | `docs/spec/01-prd.json` through `08-issues.json` |
