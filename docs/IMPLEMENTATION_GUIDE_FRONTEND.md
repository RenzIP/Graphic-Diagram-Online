# GraDiOl — Frontend Implementation Starter Guide

> **Target:** Developer frontend yang mau langsung produktif tanpa tanya ulang.
> **Single source of truth:** `docs/spec/01-prd.json` sampai `08-issues.json`.
> **Tanggal:** Februari 2026

---

## 1. Quick Overview — Apa yang Dibangun di MVP

GraDiOl = **hybrid diagram editor** (DSL text ↔ visual SVG canvas) dengan fitur:

- Auth via Supabase (Google OAuth + Magic Link)
- Hierarki **Workspace → Project → Document**
- 3 tipe diagram: **Flowchart, ERD, Use Case**
- SVG canvas: pan, zoom, grid, snap-to-grid, minimap
- Node drag-and-drop dari palette, edge click-to-connect
- DSL text editor dengan bidirectional sync ke canvas
- Export PNG & SVG
- Undo/redo (local history stack, 50 operations)
- Autosave (debounce 3s) + Ctrl+S manual save
- Dashboard: workspace list + recent documents

**Yang BUKAN MVP:** realtime collab, AI generation, version history, template marketplace, PDF export, mobile UI.

---

## 2. Urutan Baca Dokumen

| # | File | Baca untuk |
|---|------|-----------|
| 1 | `docs/spec/01-prd.json` | User stories, acceptance tests, tech stack, MVP scope |
| 2 | `docs/spec/02-domain-data-model.json` | 5 tabel MVP, JSONB schema `content`/`view`, RLS policies |
| 3 | `docs/spec/03-api-contract.json` | 16 endpoint (method, path, request/response schema) |
| 4 | `docs/spec/04-frontend-architecture.md` | Folder structure, store interfaces, event flow, autosave, component matrix |
| 5 | `docs/spec/05-backend-architecture.md` | Layered architecture, middleware stack, endpoint mapping |
| 6 | `docs/spec/07-deployment.md` | Vercel config, env vars, GCP setup |
| 7 | `docs/spec/08-issues.json` | Issue list per milestone, dependencies, acceptance criteria |

**Tips:** Baca `04-frontend-architecture.md` paling dalam — itu blueprint utama kamu.

---

## 3. Folder Structure (Existing)

```
frontend/src/
├── hooks.server.ts              # Route guard (belum aktif, placeholder)
├── app.html / app.d.ts
├── lib/
│   ├── api/
│   │   ├── client.ts            # ✅ Base fetch wrapper (ApiError, auth header)
│   │   ├── auth.ts              # Auth endpoints
│   │   ├── workspaces.ts        # Workspace CRUD
│   │   ├── projects.ts          # Project CRUD
│   │   └── documents.ts         # Document CRUD
│   ├── stores/
│   │   ├── document.ts          # ✅ DocumentState { nodes, edges } + CRUD actions
│   │   ├── canvas.ts            # ✅ CanvasState { x, y, k, connecting }
│   │   ├── selection.ts         # ✅ { nodes: string[], edges: string[] }
│   │   ├── history.ts           # ✅ Undo/redo stack (past[], future[])
│   │   └── collaboration.ts     # Phase 3 placeholder
│   ├── dsl/
│   │   ├── parser.ts            # ✅ DSL text → AST
│   │   ├── transformer.ts       # AST → DocumentState
│   │   └── serializer.ts        # DocumentState → DSL text
│   ├── components/
│   │   ├── canvas/              # Canvas.svelte, Grid, Minimap, SelectionBox
│   │   ├── nodes/               # 15+ node shapes (sudah ada)
│   │   ├── edges/               # BaseEdge, ArrowEdge, RelationEdge, EdgeHandle
│   │   ├── editor/              # Toolbar, Sidebar, PropertyPanel, DslEditor, FloatingToolbar
│   │   ├── layout/              # AppSidebar
│   │   └── ui/                  # Button, Modal, Toast, Input, Card, Avatar, dll
│   ├── utils/
│   │   ├── api.ts               # ⚠️ Legacy API wrapper (perlu migrasi ke lib/api/client.ts)
│   │   ├── constants.ts         # Grid size, zoom range, node shapes, colors
│   │   ├── geometry.ts          # screenToSVG, svgToScreen, bezier paths
│   │   ├── export.ts            # PNG/SVG/WebP/JPG export
│   │   ├── layout.ts            # Dagre auto-layout
│   │   ├── shapes.ts            # Shape configs (ports, default sizes)
│   │   └── templates.ts         # Starter diagram templates per type
│   └── ws/
│       └── client.ts            # WebSocket placeholder
├── routes/
│   ├── +page.svelte             # Landing page
│   ├── +layout.svelte           # Root layout
│   ├── (auth)/login/, register/ # Auth pages
│   ├── (app)/
│   │   ├── dashboard/           # Home: workspace list + recent docs
│   │   ├── workspace/[id]/      # Project list
│   │   ├── editor/[id]/         # ★ Main diagram editor
│   │   ├── settings/
│   │   └── team/
│   └── demo/
```

---

## 4. Step-by-Step Implementasi P0

### Step 1: Setup Project (Sudah Selesai ✅)

Project sudah ada. Verifikasi:

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # Pastikan build sukses
npm run check        # Type check
```

**Yang perlu ditambah:**
- [ ] Ganti `adapter-auto` → `adapter-vercel` di `svelte.config.js`
- [ ] Tambah env vars di `.env`:
  ```
  VITE_API_URL=http://localhost:8080/api
  PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  PUBLIC_SUPABASE_ANON_KEY=xxx
  ```
- [ ] Install `@supabase/supabase-js` dan `@supabase/ssr`

### Step 2: Supabase Auth

**Ref:** Issue `[Frontend] Implement Supabase Auth (login, register, callback)`

File yang harus diubah/buat:

| File | Aksi |
|------|------|
| `src/lib/supabase.ts` | **Buat** — init Supabase client (`createBrowserClient`) |
| `src/hooks.server.ts` | **Update** — validasi session cookie, populate `locals.user`, redirect ke `/login` |
| `src/routes/(auth)/login/+page.svelte` | **Update** — Google OAuth button + magic link form |
| `src/routes/(auth)/register/+page.svelte` | **Update** — Register flow (atau merge ke login) |
| `src/lib/api/auth.ts` | **Update** — `POST /api/auth/callback`, `GET /api/auth/me` |

**Flow:**
1. User klik "Login with Google" → `supabase.auth.signInWithOAuth({ provider: 'google' })`
2. Redirect callback → `supabase.auth.exchangeCodeForSession(code)`
3. Kirim token ke backend → `POST /api/auth/callback { access_token, refresh_token }`
4. Backend upsert `user_profiles`, return user data
5. Simpan token di `localStorage` (atau httpOnly cookie via server hook)
6. Protected routes: check token di `hooks.server.ts`, redirect ke `/login` kalau kosong

**Definition of Done:**
- Login via Google works
- Session persist across page reload
- Protected routes redirect correctly
- `GET /api/auth/me` returns profile

### Step 3: API Client Layer

**Ref:** Issue `[Frontend] Create API client layer (fetch wrapper + resource clients)`

`lib/api/client.ts` **sudah ada** dan cukup solid. Yang perlu dilengkapi:

| File | Isi |
|------|-----|
| `lib/api/workspaces.ts` | `list(page?, perPage?)`, `create(name, desc?)`, `update(id, data)`, `delete(id)` |
| `lib/api/projects.ts` | `listByWorkspace(wsId, page?)`, `create(wsId, name, desc?)`, `update(id, data)`, `delete(id)` |
| `lib/api/documents.ts` | `listByProject(projId, page?, filters?)`, `get(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `recent(limit?)` |

**Pola:** Semua method pakai `api.get/post/put/delete` dari `client.ts`. Return typed response sesuai `03-api-contract.json`.

**⚠️ Migrasi:** `lib/utils/api.ts` (legacy) masih dipake oleh `documentStore.load/save`. Setelah `lib/api/documents.ts` jadi, ubah import di `stores/document.ts` dari `$lib/utils/api` → `$lib/api/documents`.

**Contoh response type:**
```typescript
// lib/api/types.ts
interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; per_page: number; total: number; total_pages: number };
}

interface WorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  description: string | null;
  role: 'owner' | 'editor' | 'viewer';
  member_count: number;
  created_at: string;
  updated_at: string;
}
```

### Step 4: Svelte Stores

**Ref:** Issue `[Frontend] Implement Svelte stores (document, canvas, selection, history)`

**Semua 4 stores sudah diimplementasi** ✅

| Store | File | Status |
|-------|------|--------|
| `documentStore` | `stores/document.ts` | ✅ Nodes/edges + CRUD + history integration |
| `canvasStore` | `stores/canvas.ts` | ✅ Pan/zoom/connection state |
| `selectionStore` | `stores/selection.ts` | ✅ Multi-select nodes/edges |
| `historyStore` | `stores/history.ts` | ✅ Undo/redo (max 50) |

**Yang perlu diupdate:**
- [ ] `documentStore.load/save` harus pakai `lib/api/documents.ts` (bukan `lib/utils/api.ts`)
- [ ] `documentStore.save` harus kirim `content` + `view` terpisah sesuai API contract:
  ```typescript
  // PUT /api/documents/:id body:
  { title, content: { nodes, edges }, view: { positions, styles, routing } }
  ```
- [ ] Pisahkan `positions` dan `styles` dari `Node` ke `view` JSONB sebelum save

### Step 5: Dashboard Page

**Ref:** Issue `[Frontend] Implement dashboard page (workspace list + recent docs)`

| File | Aksi |
|------|------|
| `routes/(app)/dashboard/+page.ts` | **Buat** — `load` function: fetch workspaces + recent docs |
| `routes/(app)/dashboard/+page.svelte` | **Update** — workspace cards, recent docs, create workspace modal |

**Acceptance Criteria:**
- [ ] List workspace sebagai cards (name, description, member count)
- [ ] "Recent Documents" section (10 terbaru, dari `GET /api/documents/recent`)
- [ ] Create workspace button → modal → `POST /api/workspaces`
- [ ] Click workspace → `/workspace/[id]`
- [ ] Click document → `/editor/[id]`
- [ ] Empty state untuk no workspaces / no docs

### Step 6: Editor Layout Skeleton

**Ref:** Issue `[Frontend] Build editor layout (Toolbar + Sidebar + PropertyPanel)`

**Sudah ada** di `routes/(app)/editor/[id]/+page.svelte` dengan lengkap:
- Toolbar (top) — undo, redo, zoom, export, save, title edit
- Sidebar (left) — shape palette per diagram type
- PropertyPanel (right) — edit selected node/edge properties
- DslEditor (bottom) — collapsible DSL text panel
- Minimap — bottom-right
- FloatingToolbar — context menu on selection

**Yang perlu diperhatikan:**
- Sidebar palette content berdasarkan `diagramType` (lihat `constants.ts` → `NODE_SHAPES`)
- PropertyPanel baca dari `selectionStore`, tulis ke `documentStore`
- DslEditor pakai `syncDirection` flag untuk prevent infinite loop

### Step 7: Canvas Pan/Zoom

**Ref:** Issue `[Frontend] Build SVG canvas with pan/zoom (Canvas.svelte)`

**Sudah diimplementasi** ✅ di `components/canvas/Canvas.svelte`:
- Pan via mouse drag
- Zoom via scroll wheel (centered on cursor)
- Grid rendering
- Transform via `canvasStore` `{ x, y, k }`

**Coordinate conversion:** Gunakan `screenToSVG()` dan `svgToScreen()` dari `utils/geometry.ts` untuk konversi mouse event ↔ SVG space.

---

## 5. Mapping Issue → File

### MVP-0 Setup (Frontend Issues)

| Issue | File yang dibuat/diubah |
|-------|------------------------|
| Setup SvelteKit + Tailwind | `svelte.config.js`, `package.json`, `routes/+layout.svelte`, `components/ui/*.svelte` |
| Supabase Auth | `hooks.server.ts`, `routes/(auth)/login/`, `routes/(auth)/register/`, `lib/api/auth.ts`, `lib/supabase.ts` |

### MVP-1 Core (Frontend Issues)

| Issue | File yang dibuat/diubah |
|-------|------------------------|
| API client layer | `lib/api/client.ts` ✅, `lib/api/workspaces.ts`, `lib/api/projects.ts`, `lib/api/documents.ts`, `lib/api/types.ts` |
| Svelte stores | `lib/stores/document.ts` ✅, `lib/stores/canvas.ts` ✅, `lib/stores/selection.ts` ✅, `lib/stores/history.ts` ✅ |
| SVG canvas pan/zoom | `components/canvas/Canvas.svelte` ✅, `components/canvas/Grid.svelte` ✅, `utils/geometry.ts` ✅ |
| Node rendering + drag | `components/nodes/NodeWrapper.svelte`, `components/nodes/NodeRenderer.svelte`, `components/nodes/ProcessNode.svelte` ✅, dll |
| Edge rendering + connection | `components/edges/EdgeRenderer.svelte` ✅, `components/edges/BaseEdge.svelte` ✅, `components/edges/ArrowEdge.svelte` ✅ |
| Editor layout | `components/editor/Toolbar.svelte` ✅, `components/editor/Sidebar.svelte` ✅, `components/editor/PropertyPanel.svelte` ✅ |
| DSL engine | `dsl/parser.ts` ✅, `dsl/transformer.ts` ✅, `dsl/serializer.ts` ✅ |
| DSL editor + sync | `components/editor/DslEditor.svelte` ✅ |
| Dashboard page | `routes/(app)/dashboard/+page.svelte`, `routes/(app)/dashboard/+page.ts` |
| Workspace page | `routes/(app)/workspace/[id]/+page.svelte`, `routes/(app)/workspace/[id]/+page.ts` |

### MVP-2 Polish (Frontend Issues)

| Issue | File yang dibuat/diubah |
|-------|------------------------|
| PNG/SVG export | `utils/export.ts` ✅, `components/editor/Toolbar.svelte` |
| Autosave + dirty indicator | `routes/(app)/editor/[id]/+page.svelte`, `components/editor/Toolbar.svelte` |
| ERD nodes/edges | `components/nodes/EntityNode.svelte` ✅, `components/nodes/AttributeNode.svelte` ✅, `components/edges/RelationEdge.svelte` ✅ |
| Use Case nodes | `components/nodes/ActorNode.svelte` ✅, `components/nodes/UseCaseNode.svelte` |
| Selection box + multi-select | `components/canvas/SelectionBox.svelte` ✅ |
| Minimap | `components/canvas/Minimap.svelte` ✅ |
| Auto-layout Dagre | `utils/layout.ts` |
| Landing page | `routes/+page.svelte` |
| Keyboard shortcuts | `routes/(app)/editor/[id]/+page.svelte` |

---

## 6. Definition of Done per Kategori

### Auth
- [ ] Login Google OAuth berhasil redirect ke dashboard
- [ ] Token tersimpan, persist setelah refresh
- [ ] Protected routes redirect ke `/login` tanpa token
- [ ] `GET /api/auth/me` return profile

### API Client
- [ ] Semua method return typed response sesuai `03-api-contract.json`
- [ ] Error handling: `ApiError` thrown dengan `status` + `code` + `message`
- [ ] Token auto-attached di header `Authorization: Bearer <token>`

### Dashboard
- [ ] Workspace list muncul dari API
- [ ] Recent docs muncul dari API
- [ ] Create workspace via modal works
- [ ] Navigation ke workspace/editor works
- [ ] Empty state rendered

### Editor Canvas
- [ ] Pan (drag) dan zoom (scroll) smooth
- [ ] Grid rendered dan scales dengan zoom
- [ ] Nodes dari store ter-render di canvas
- [ ] Drag node → position update di store
- [ ] Click node → selection update
- [ ] Connect port → edge tercipta di store

### DSL Sync
- [ ] Ketik DSL → canvas update (< 500ms)
- [ ] Edit canvas → DSL text update
- [ ] Tidak ada infinite loop (syncDirection guard)
- [ ] Roundtrip: parse → transform → serialize → parse = same AST

### Export
- [ ] PNG download dengan semua nodes/edges, resolusi ≥2x
- [ ] SVG download valid XML
- [ ] Export capture full diagram (bukan cuma viewport)

### Save
- [ ] Autosave 3s setelah mutation terakhir
- [ ] Dirty indicator (●) di toolbar
- [ ] `beforeunload` warn kalau dirty
- [ ] Ctrl+S immediate save

---

## 7. Branching & PR Workflow

### Branch Naming

```
feature/FE-<issue-short-name>
fix/FE-<bug-short-name>
chore/FE-<task-short-name>
```

**Contoh:**
```
feature/FE-supabase-auth
feature/FE-api-client-layer
feature/FE-dashboard-page
feature/FE-canvas-pan-zoom
fix/FE-dsl-sync-loop
chore/FE-adapter-vercel
```

### Workflow

1. **Sync** `develop` terbaru:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Branch** dari `develop`:
   ```bash
   git checkout -b feature/FE-supabase-auth
   ```
3. **Commit** dengan format:
   ```
   feat(frontend): implement Supabase Auth login flow
   fix(frontend): prevent DSL sync infinite loop
   chore(frontend): switch to adapter-vercel
   ```
4. **Push** dan buat PR ke `develop`:
   ```bash
   git push origin feature/FE-supabase-auth
   ```
5. **PR title** = commit message utama
6. **PR body**: checklist dari issue acceptance criteria
7. **Review**: minimal 1 approval
8. **Merge**: squash merge ke `develop`

### Urutan PR (dependency-aware)

```
1. chore/FE-adapter-vercel + env setup
2. feature/FE-supabase-auth
3. feature/FE-api-client-layer        (depends on #2)
4. feature/FE-stores-update           (migrasi utils/api → lib/api)
5. feature/FE-dashboard-page          (depends on #3)
6. feature/FE-workspace-page          (depends on #5)
7. feature/FE-editor-canvas           (sudah ada, review + polish)
8. feature/FE-dsl-editor-sync         (sudah ada, review + polish)
9. feature/FE-export-png-svg          (sudah ada, review + polish)
10. feature/FE-autosave               (depends on #4)
11. feature/FE-erd-nodes
12. feature/FE-usecase-nodes
13. feature/FE-landing-page
14. feature/FE-keyboard-shortcuts
```

---

## 8. Checklist Sebelum Merge

### Setiap PR:

- [ ] `npm run build` sukses tanpa error
- [ ] `npm run check` (svelte-check) pass
- [ ] `npm run lint` pass
- [ ] Tidak ada `console.log` stray (debug only)
- [ ] Tidak ada hardcoded API URL (pakai `VITE_API_URL`)
- [ ] Tidak ada hardcoded Supabase keys (pakai `PUBLIC_SUPABASE_*`)
- [ ] Types: tidak ada `any` kecuali terdokumentasi
- [ ] Komponen baru ada di folder yang benar sesuai spec
- [ ] Import path pakai `$lib/...` (bukan relative `../../`)
- [ ] Acceptance criteria dari issue terpenuhi
- [ ] Tested manual di browser (minimal Chrome)

### Sebelum merge ke `main`:

- [ ] Semua PR MVP-1 sudah merge ke `develop`
- [ ] Build production sukses: `npm run build`
- [ ] Env vars Vercel sudah di-set: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_API_URL`
- [ ] Smoke test di preview deploy:
  - Login works
  - Dashboard loads workspaces
  - Editor renders canvas
  - Save & load document works
  - Export PNG/SVG works

---

## Quick Reference: Key Patterns

### Store Mutation Pattern
```typescript
// Selalu save history SEBELUM mutate
addNode: (node: Node) => {
    update((state) => {
        saveHistory(state);  // ← push ke history dulu
        return { ...state, nodes: [...state.nodes, node] };
    });
}
```

### API Call Pattern
```typescript
import { api } from '$lib/api/client';

const workspaces = await api.get<PaginatedResponse<Workspace>>('/workspaces', {
    params: { page: '1', per_page: '20' }
});
```

### Coordinate Conversion
```typescript
import { screenToSVG } from '$lib/utils/geometry';

// Mouse event → SVG world coordinates
const worldPos = screenToSVG(
    { x: event.clientX, y: event.clientY },
    { x: $canvasStore.x, y: $canvasStore.y, k: $canvasStore.k }
);
```

### DSL Sync Guard
```typescript
let syncDirection: 'dsl' | 'canvas' | null = null;

// Dari DslEditor → Canvas
syncDirection = 'dsl';
documentStore.set(transformedState);
syncDirection = null;

// Dari Canvas → DslEditor (skip kalau dsl sedang update)
if (syncDirection !== 'dsl') {
    dslText = serializer.serialize(state);
}
```

### Document Save Payload
```typescript
// Backend expects content & view separated
const payload = {
    title: diagramTitle,
    content: {
        nodes: state.nodes.map(n => ({
            id: n.id, type: n.type, label: n.label, properties: n.data
        })),
        edges: state.edges.map(e => ({
            id: e.id, source: e.source, target: e.target, label: e.label, type: e.type
        }))
    },
    view: {
        positions: Object.fromEntries(state.nodes.map(n => [n.id, n.position])),
        styles: Object.fromEntries(state.nodes.filter(n => n.style).map(n => [n.id, n.style])),
        routing: Object.fromEntries(state.edges.filter(e => e.waypoints).map(e => [e.id, { type: e.type, points: e.waypoints }]))
    }
};
```
