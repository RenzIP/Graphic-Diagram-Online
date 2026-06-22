# GraDiOl Backend

Backend service untuk GraDiOl (Graphic Diagram Online), platform editor diagram kolaboratif berbasis web.

## Tech Stack

| Teknologi | Fungsi |
| --- | --- |
| Go 1.25 | Bahasa utama |
| Fiber v2 | HTTP framework + WebSocket |
| GORM | ORM PostgreSQL |
| Supabase/PostgreSQL | Database utama |
| Redis | Presence tracking, node locks, pub/sub |
| Supabase Auth | Autentikasi JWT |

## Setup

```bash
cp .env.example .env
go mod download
```

Isi database environment dengan connection string Supabase/PostgreSQL:

```env
SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
FRONTEND_URL=http://localhost:3000
```

## Database

Schema PostgreSQL tersedia di:

```bash
supabase/schema.sql
```

Jalankan migrasi lokal:

```bash
go run ./cmd/migrate setup
```

Seed data demo:

```bash
go run ./cmd/migrate seed
```

Reset schema:

```bash
go run ./cmd/migrate reset
```

## Development

```bash
go run ./cmd/api
```

Server berjalan di `http://localhost:8080`.

## Deploy ke Render

Blueprint deploy tersedia di root repo:

```bash
render.yaml
```

Render akan memakai `backend` sebagai root service, build binary API, lalu menjalankan:

```bash
./bin/gradiol-api
```

Build hanya akan terpanggil saat ada perubahan di `backend/**` atau `render.yaml`.

Env production yang perlu diisi di dashboard Render:

```env
ENV=production
JWT_SECRET=...
SUPABASE_DATABASE_URL=...
FRONTEND_URL=https://domain-frontend
BACKEND_URL=https://domain-backend-render
REDIS_URL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

Render otomatis mengisi `PORT`, jadi tidak perlu set manual.

Setelah deploy pertama, jalankan schema setup dari Render Shell:

```bash
./bin/gradiol-migrate setup
```

Catatan: migrasi sengaja tidak dimasukkan sebagai `preDeployCommand` karena fitur tersebut hanya tersedia untuk paid web service di Render. Untuk plan free, jalankan command migrasi secara manual dari Render Shell.

## API

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/callback` | OAuth callback handler |
| GET | `/api/workspaces` | List user workspaces |
| POST | `/api/workspaces` | Create workspace |
| PUT | `/api/workspaces/:id` | Update workspace |
| DELETE | `/api/workspaces/:id` | Delete workspace |
| GET | `/api/workspaces/:id/projects` | List projects in workspace |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id/documents` | List documents in project |
| POST | `/api/documents` | Create document |
| GET | `/api/documents/:id` | Get document detail |
| PUT | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Delete document |

## WebSocket

```text
ws://localhost:8080/ws/:documentId
```
