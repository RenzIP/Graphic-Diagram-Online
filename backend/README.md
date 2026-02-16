# GraDiOl — Backend

Backend service untuk **GraDiOl** (Graphic Diagram Online), platform editor diagram kolaboratif berbasis web.

## Tech Stack

| Teknologi         | Fungsi                                 |
| ----------------- | -------------------------------------- |
| **Go 1.25**       | Bahasa utama                           |
| **Fiber v2**      | HTTP framework + WebSocket             |
| **Bun ORM**       | Database ORM untuk PostgreSQL          |
| **PostgreSQL**    | Database utama (Supabase Managed)      |
| **Redis**         | Presence tracking, node locks, pub/sub |
| **Supabase Auth** | Autentikasi (JWT)                      |

## Struktur Proyek

```
backend/
├── cmd/api/
│   └── main.go                    # Entry point
├── internal/
│   ├── config/                    # Environment config
│   ├── middleware/                 # Auth, CORS, rate limiting
│   ├── db/
│   │   ├── conn.go                # PostgreSQL connection
│   │   └── migrations/            # SQL migration files
│   ├── domain/
│   │   ├── user/                  # Auth & profile
│   │   ├── workspace/             # Workspace & members
│   │   ├── project/               # Project CRUD
│   │   ├── document/              # Document CRUD (JSONB)
│   │   ├── version/               # Version history
│   │   └── template/              # Template CRUD
│   ├── http/                      # REST API handlers & routes
│   ├── redis/                     # Presence, locks, pub/sub
│   └── ws/                        # WebSocket hub & handlers
├── go.mod
├── go.sum
├── Dockerfile
└── .env.example
```

## Prerequisites

- [Go 1.25+](https://go.dev/dl/)
- [PostgreSQL 15+](https://www.postgresql.org/) atau [Supabase](https://supabase.com/)
- [Redis 7+](https://redis.io/)

## Setup & Development

### 1. Clone & masuk ke folder

```bash
git clone https://github.com/RenzIP/Graphic-Diagram-Online.git
cd Graphic-Diagram-Online/backend
```

### 2. Setup environment variables

```bash
cp .env.example .env
```

Isi file `.env`:

```env
# Server
PORT=8080

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Redis
REDIS_URL=redis://localhost:6379

# Supabase Auth
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS
CORS_ORIGINS=http://localhost:5173
```

### 3. Install dependencies

```bash
go mod download
```

### 4. Run migrations

```bash
# Jalankan migration file secara manual via Supabase Dashboard
# atau menggunakan tool seperti golang-migrate
```

### 5. Jalankan server

```bash
go run ./cmd/api
```

Server akan berjalan di `http://localhost:8080`.

## API Endpoints

### Health

| Method | Endpoint      | Deskripsi    |
| ------ | ------------- | ------------ |
| `GET`  | `/api/health` | Health check |

### Auth

| Method | Endpoint             | Deskripsi              |
| ------ | -------------------- | ---------------------- |
| `POST` | `/api/auth/callback` | OAuth callback handler |

### Workspaces

| Method   | Endpoint              | Deskripsi            |
| -------- | --------------------- | -------------------- |
| `GET`    | `/api/workspaces`     | List user workspaces |
| `POST`   | `/api/workspaces`     | Create workspace     |
| `PUT`    | `/api/workspaces/:id` | Update workspace     |
| `DELETE` | `/api/workspaces/:id` | Delete workspace     |

### Projects

| Method   | Endpoint                       | Deskripsi                  |
| -------- | ------------------------------ | -------------------------- |
| `GET`    | `/api/workspaces/:id/projects` | List projects in workspace |
| `POST`   | `/api/projects`                | Create project             |
| `PUT`    | `/api/projects/:id`            | Update project             |
| `DELETE` | `/api/projects/:id`            | Delete project             |

### Documents

| Method   | Endpoint                      | Deskripsi                 |
| -------- | ----------------------------- | ------------------------- |
| `GET`    | `/api/projects/:id/documents` | List documents in project |
| `POST`   | `/api/documents`              | Create document           |
| `GET`    | `/api/documents/:id`          | Get document detail       |
| `PUT`    | `/api/documents/:id`          | Update document           |
| `DELETE` | `/api/documents/:id`          | Delete document           |

### WebSocket

| Endpoint                             | Deskripsi                   |
| ------------------------------------ | --------------------------- |
| `ws://localhost:8080/ws/:documentId` | Realtime collaboration room |

## Deployment (GCP Cloud Run)

```bash
# Build & push container image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/gradiol-backend

# Deploy ke Cloud Run
gcloud run deploy gradiol-backend \
    --image gcr.io/YOUR_PROJECT_ID/gradiol-backend \
    --platform managed \
    --region asia-southeast2 \
    --allow-unauthenticated
```

## License

MIT
