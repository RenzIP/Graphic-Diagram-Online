# GraDiOl — Frontend

Frontend application untuk **GraDiOl** (Graphic Diagram Online), platform editor diagram kolaboratif berbasis web.

## Tech Stack

| Teknologi          | Fungsi                                |
| ------------------ | ------------------------------------- |
| **SvelteKit**      | Full-stack framework (SSR + SPA)      |
| **TypeScript**     | Type-safe JavaScript                  |
| **TailwindCSS v4** | Utility-first CSS framework           |
| **SVG**            | Rendering engine untuk canvas diagram |

## Struktur Proyek

```
frontend/src/
├── lib/
│   ├── api/                       # REST API client
│   │   ├── client.ts              # Base fetch wrapper
│   │   ├── auth.ts                # Auth endpoints
│   │   ├── documents.ts           # Document CRUD
│   │   ├── workspaces.ts          # Workspace CRUD
│   │   └── projects.ts            # Project CRUD
│   ├── components/
│   │   ├── canvas/                # SVG canvas engine
│   │   │   ├── Canvas.svelte      # Main canvas (pan, zoom)
│   │   │   ├── Grid.svelte        # Background grid
│   │   │   ├── Minimap.svelte     # Minimap overview
│   │   │   └── SelectionBox.svelte
│   │   ├── editor/                # Editor UI panels
│   │   │   ├── Toolbar.svelte     # Top toolbar
│   │   │   ├── Sidebar.svelte     # Shape palette
│   │   │   ├── PropertyPanel.svelte
│   │   │   └── DslEditor.svelte   # Text editor (DSL)
│   │   ├── nodes/                 # Diagram node shapes
│   │   ├── edges/                 # Connection components
│   │   └── ui/                    # Shared UI (Button, Modal, etc.)
│   ├── dsl/                       # DSL parser & serializer
│   ├── layout/                    # Auto-layout (Dagre)
│   ├── stores/                    # Svelte reactive stores
│   ├── ws/                        # WebSocket client
│   └── utils/                     # Helpers & constants
├── routes/
│   ├── (auth)/                    # Login, callback
│   ├── (app)/
│   │   ├── dashboard/             # Home / workspace list
│   │   ├── workspace/[id]/        # Project list
│   │   └── editor/[id]/           # Diagram editor
│   ├── +layout.svelte
│   └── +page.svelte               # Landing page
└── hooks.server.ts                # Auth guard
```

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (included with Node.js)

## Setup & Development

### 1. Clone & masuk ke folder

```bash
git clone https://github.com/RenzIP/Graphic-Diagram-Online.git
cd Graphic-Diagram-Online/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Buat file `.env` di root folder `frontend/`:

```env
# Backend API URL
PUBLIC_API_URL=http://localhost:8080

# Supabase (for Auth)
PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Jalankan development server

```bash
npm run dev
```

Buka `http://localhost:5173` di browser.

## Available Scripts

| Script            | Deskripsi                             |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start development server (hot reload) |
| `npm run build`   | Build untuk production                |
| `npm run preview` | Preview production build              |
| `npm run check`   | Type checking dengan svelte-check     |
| `npm run lint`    | Lint dengan ESLint + Prettier         |
| `npm run format`  | Auto-format code dengan Prettier      |

## Fitur Editor

| Fitur               | Deskripsi                                                |
| ------------------- | -------------------------------------------------------- |
| **SVG Canvas**      | Pan, zoom, infinite canvas, snap-to-grid, minimap        |
| **Node Editing**    | Drag, resize, inline text editing, style customization   |
| **Edge/Connection** | Click-to-connect, auto-routing (bezier/straight/step)    |
| **DSL Editor**      | Split view — text editor (kiri) + visual preview (kanan) |
| **Undo/Redo**       | Ctrl+Z / Ctrl+Shift+Z                                    |
| **Export**          | PNG, SVG, PDF, DSL Text                                  |
| **Collaboration**   | Realtime cursors, presence indicator, node locking       |

## Deployment (Vercel)

### Setup di Vercel Dashboard:

1. Import repository dari GitHub
2. Set **Root Directory** ke `frontend`
3. Vercel otomatis detect SvelteKit
4. Tambahkan Environment Variables:
   - `PUBLIC_API_URL` → URL backend (Cloud Run)
   - `PUBLIC_SUPABASE_URL` → Supabase project URL
   - `PUBLIC_SUPABASE_ANON_KEY` → Supabase anon key

### Adapter config (`svelte.config.js`):

Untuk deploy ke Vercel, ganti adapter:

```bash
npm i -D @sveltejs/adapter-vercel
```

```js
import adapter from '@sveltejs/adapter-vercel';

const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
```

## License

MIT
