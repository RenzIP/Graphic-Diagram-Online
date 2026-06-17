# GraDiOl Frontend

Frontend application untuk GraDiOl (Graphic Diagram Online), platform editor diagram kolaboratif berbasis web.

## Tech Stack

| Teknologi | Fungsi |
| --- | --- |
| Next.js | React framework dengan App Router |
| React | UI component layer |
| JavaScript | Bahasa aplikasi |
| Tailwind CSS v4 | Utility-first CSS framework |
| SVG | Rendering canvas diagram |

## Struktur Proyek

```text
frontend/
├── app/
│   ├── layout.js
│   ├── page.js
│   ├── globals.css
│   ├── auth/callback/page.js
│   ├── dashboard/page.js
│   ├── demo/page.js
│   ├── editor/[id]/page.js
│   ├── login/page.js
│   ├── register/page.js
│   ├── settings/page.js
│   ├── team/page.js
│   └── workspace/[id]/page.js
├── components/
│   ├── canvas/
│   ├── edges/
│   ├── editor/
│   ├── layout/
│   ├── nodes/
│   └── ui/
├── hooks/
├── lib/
│   ├── api/
│   ├── dsl/
│   ├── stores/
│   ├── utils/
│   └── ws/
├── public/
├── proxy.js
├── next.config.js
└── package.json
```

## Setup

```bash
npm install
npm run dev
```

Development server berjalan di `http://localhost:3000`.

## Environment Variables

Buat file `.env` atau `.env.local` di folder `frontend/`.

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

## Scripts

| Script | Deskripsi |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build production |
| `npm run start` | Jalankan production server |
| `npm run lint` | Lint source code |

## Fitur Editor

| Fitur | Deskripsi |
| --- | --- |
| SVG Canvas | Pan, zoom, infinite canvas, snap-to-grid, minimap |
| Node Editing | Drag, resize, inline text editing, style customization |
| Edge/Connection | Click-to-connect dan rendering koneksi |
| DSL Editor | Text editor dan visual preview |
| Undo/Redo | History editing |
| Export | PNG, SVG, PDF, DSL text |
| Collaboration | Realtime cursors, presence indicator, node locking |

## Deployment

Project ini dapat dideploy sebagai aplikasi Next.js. Pastikan root directory deployment mengarah ke folder `frontend` dan environment variable publik memakai prefix `NEXT_PUBLIC_`.
