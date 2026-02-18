# GraDiOl — Frontend Architecture (SvelteKit MVP)

> **Status:** Proposed — this document defines the planned frontend architecture for the GraDiOl MVP. All structures, stores, and components described here are design targets, not yet implemented.

---

## 1. Proposed Folder Structure

```
frontend/src/
├── hooks.server.ts              # Supabase Auth guard (JWT cookie → locals.user)
├── app.html / app.d.ts
│
├── lib/
│   ├── api/                     # REST API clients (thin wrappers over fetch)
│   │   ├── client.ts            # Base fetch helper: auth header, error mapping, base URL
│   │   ├── auth.ts              # POST /auth/callback, GET /auth/me
│   │   ├── workspaces.ts        # CRUD /workspaces
│   │   ├── projects.ts          # CRUD /projects, GET /workspaces/:id/projects
│   │   └── documents.ts         # CRUD /documents, GET /projects/:id/documents
│   │
│   ├── stores/                  # Svelte writable stores (global state)
│   │   ├── document.ts          # DocumentState { nodes, edges } + CRUD actions
│   │   ├── canvas.ts            # CanvasState { x, y, k, connecting? }
│   │   ├── selection.ts         # { nodes: string[], edges: string[] }
│   │   ├── history.ts           # Undo/redo stack { past[], future[] }
│   │   └── collaboration.ts     # (Phase 3 placeholder) Remote cursors, presence
│   │
│   ├── dsl/                     # DSL engine (Text ⇄ Diagram)
│   │   ├── parser.ts            # DSL text → AST tokens
│   │   ├── transformer.ts       # AST → DocumentState { nodes[], edges[] }
│   │   └── serializer.ts        # DocumentState → DSL text
│   │
│   ├── components/
│   │   ├── canvas/              # SVG canvas engine
│   │   │   ├── Canvas.svelte    # Root SVG with pan/zoom, event delegation
│   │   │   ├── Grid.svelte      # Background dot/line grid
│   │   │   ├── Minimap.svelte   # Viewport overview (scaled-down canvas)
│   │   │   └── SelectionBox.svelte  # Marquee drag-select rectangle
│   │   │
│   │   ├── nodes/               # Shape components per NodeType
│   │   │   ├── NodeWrapper.svelte   # Shared drag/resize/select wrapper
│   │   │   ├── NodeRenderer.svelte  # Dynamic type → component dispatcher
│   │   │   ├── ProcessNode.svelte
│   │   │   ├── DecisionNode.svelte
│   │   │   ├── StartEndNode.svelte
│   │   │   ├── EntityNode.svelte
│   │   │   ├── ActorNode.svelte
│   │   │   ├── UseCaseNode.svelte
│   │   │   ├── AttributeNode.svelte
│   │   │   ├── RelationshipNode.svelte
│   │   │   ├── DatabaseNode.svelte
│   │   │   ├── InputOutputNode.svelte
│   │   │   ├── LifelineNode.svelte
│   │   │   ├── TextNode.svelte
│   │   │   ├── TriangleNode.svelte
│   │   │   └── ShapeNode.svelte     # Generic fallback shape
│   │   │
│   │   ├── edges/               # Connection components
│   │   │   ├── EdgeRenderer.svelte      # Dynamic type → edge component
│   │   │   ├── BaseEdge.svelte          # Shared path rendering + label
│   │   │   ├── ArrowEdge.svelte         # Directed arrow edge
│   │   │   ├── RelationEdge.svelte      # ERD-style relation (cardinality)
│   │   │   └── EdgeHandleRenderer.svelte # Reconnection drag handles
│   │   │
│   │   ├── editor/              # Editor UI panels
│   │   │   ├── Toolbar.svelte       # Top bar: undo, redo, zoom, export, save
│   │   │   ├── Sidebar.svelte       # Left: shape palette per diagram type
│   │   │   ├── PropertyPanel.svelte # Right: style editor for selected node/edge
│   │   │   ├── DslEditor.svelte     # Bottom/split: DSL text editor panel
│   │   │   └── FloatingToolbar.svelte # Context actions on selection
│   │   │
│   │   ├── layout/
│   │   │   └── AppSidebar.svelte    # Dashboard navigation sidebar
│   │   │
│   │   └── ui/                  # Shared UI primitives
│   │       ├── Button.svelte
│   │       ├── Modal.svelte
│   │       ├── Toast.svelte
│   │       ├── Input.svelte
│   │       ├── Card.svelte
│   │       └── Avatar.svelte
│   │
│   ├── utils/
│   │   ├── api.ts               # High-level API helpers (getDocument, saveDocument)
│   │   ├── constants.ts         # Grid size, max history, node defaults, colors
│   │   ├── geometry.ts          # Hit-test, intersection, bounding box, Transform type
│   │   ├── export.ts            # PNG/SVG export (Canvas API toBlob, SVG serialize)
│   │   ├── layout.ts            # Dagre auto-layout wrapper
│   │   ├── shapes.ts            # Shape configs per NodeType (ports, default size)
│   │   └── templates.ts         # Starter diagram templates per diagram type
│   │
│   └── ws/
│       └── client.ts            # WebSocket manager (Phase 3 placeholder)
│
└── routes/
    ├── +page.svelte             # Landing page (public)
    ├── +layout.svelte           # Root layout
    ├── (auth)/
    │   ├── +layout.svelte       # Auth layout (centered card)
    │   ├── login/+page.svelte
    │   └── register/+page.svelte
    ├── (app)/                   # Authenticated group
    │   ├── dashboard/+page.svelte       # Home: workspace list + recent docs
    │   ├── workspace/[id]/+page.svelte  # Project list in workspace
    │   ├── editor/[id]/+page.svelte     # ★ Main diagram editor
    │   ├── settings/+page.svelte
    │   └── team/+page.svelte
    └── demo/+page.server.ts     # Demo route (server data)
```

---

## 2. Stores — Planned State Shape & Responsibilities

### `documentStore` — Source of Truth for Diagram Data

```typescript
// Planned interface
interface DocumentState {
    nodes: Node[];    // Semantic model (what things exist)
    edges: Edge[];    // Connections between nodes
}

interface Node {
    id: string;
    type: NodeType;       // 'process' | 'decision' | 'start-end' | 'entity' | ...
    position: { x: number; y: number };
    width?: number; height?: number;
    label?: string;
    style?: { fill, stroke, strokeWidth, fontSize, fontFamily, ... };
    locked?: boolean;
}

interface Edge {
    id: string;
    source: string;       // Source node ID
    target: string;       // Target node ID
    type?: 'default' | 'step' | 'straight' | 'bezier';
    label?: string;
    waypoints?: { x: number; y: number }[];
    style?: { stroke, strokeWidth, strokeDasharray, opacity };
    markerStart?: string;
    markerEnd?: string;
}

// Planned actions:
// addNode, updateNode, removeNode, moveNodeOrder,
// addEdge, updateEdge, removeEdge, load(id), save(id)
// Every mutation should call historyStore.push() BEFORE mutating.
```

### `canvasStore` — Viewport Transform & Connection State

```typescript
// Planned interface
interface CanvasState {
  x: number;
  y: number;
  k: number; // pan-x, pan-y, zoom-scale
  connecting?: {
    // Active edge-drawing state
    sourceNodeId: string;
    sourceHandle: "top" | "right" | "bottom" | "left";
    mousePos: { x: number; y: number };
    candidateNodeId?: string;
    modifyingEdgeId?: string; // Reconnecting existing edge
    isReversed?: boolean;
  };
}
// Planned actions: pan(dx,dy), zoom(delta,center), setZoom(k), reset(),
//                  startConnection, updateConnection, endConnection
```

### `selectionStore` — Multi-Select State

```typescript
// Planned interface
interface SelectionState {
  nodes: string[]; // Selected node IDs
  edges: string[]; // Selected edge IDs
}
// Planned actions: selectNode(id, multi?), selectEdge(id, multi?),
//                  selectNodes(ids, multi?), clear()
```

### `historyStore` — Undo/Redo Command Stack

```typescript
// Planned interface
interface HistoryState {
  past: DocumentState[]; // Undo stack (capped at MAX_HISTORY_SIZE)
  future: DocumentState[]; // Redo stack
  canUndo: boolean;
  canRedo: boolean;
}
// Planned actions: push(state), undo(current) → previous, redo(current) → next, clear()
```

### `collaborationStore` — Phase 3 Placeholder

```typescript
// Will be designed in Phase 3: remote cursors, presence list, node locks
// For now, export an empty store to avoid import errors later
```

---

## 3. Editor Layout

```
┌──────────────────────────────────────────────────────────┐
│  Toolbar (top)                                           │
│  [Undo][Redo][Zoom ±][Fit][Grid][Snap][Export][Save]     │
├────────┬─────────────────────────────────┬───────────────┤
│        │                                 │               │
│ Side-  │        Canvas.svelte            │  Property     │
│ bar    │        (SVG viewport)           │  Panel        │
│        │                                 │               │
│ Shape  │  ┌──────────────────────┐       │  Fill, Stroke │
│ Palette│  │  Grid + Nodes + Edges│       │  Font, Size   │
│ per    │  │  + SelectionBox      │       │  Edge Style   │
│ type   │  └──────────────────────┘       │  Lock, Order  │
│        │  [Minimap]                      │               │
├────────┴─────────────────────────────────┴───────────────┤
│  DslEditor (bottom, collapsible split panel)             │
│  ┌────────────────────────────────────────────────────┐  │
│  │  @flowchart "Login Process"                        │  │
│  │  start "Mulai" -> process "Input" -> decision ...  │  │
│  └────────────────────────────────────────────────────┘  │
│  FloatingToolbar (appears on selection)                   │
└──────────────────────────────────────────────────────────┘
```

**Panel Visibility Logic:**

- **Sidebar:** always visible; palette content changes based on `diagram_type`
- **PropertyPanel:** always visible; shows properties of first selected item or empty state
- **DslEditor:** collapsible via toggle in Toolbar; defaultcollapsed
- **FloatingToolbar:** appears near selected nodes on right-click or multi-select
- **Minimap:** toggle via Toolbar button; renders in bottom-right corner of canvas

---

## 4. Event Flow

### User Interaction → State → Render Cycle

```
┌──────────────┐     ┌─────────────────┐     ┌─────────────┐
│   User Input │ ──→ │   Store Action   │ ──→ │  Reactive   │
│   (mouse,    │     │   (mutation)     │     │  Re-render  │
│    keyboard) │     │                  │     │  (Svelte)   │
└──────────────┘     └─────────────────┘     └─────────────┘
```

### Key Event Flows

| User Action          | Planned Handler Chain                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Drag node**        | `NodeWrapper` → `documentStore.updateNode(id, { position })` → Canvas re-renders                                                                             |
| **Click to connect** | Port click → `canvasStore.startConnection` → mousemove → `updateConnection` → mouseup on target port → `documentStore.addEdge` + `canvasStore.endConnection` |
| **Type DSL**         | `DslEditor` onChange → `parser.parse(text)` → `transformer.transform(ast)` → `documentStore.set(newState)`                                                   |
| **Visual → DSL**     | `documentStore` subscribe → `serializer.serialize(state)` → update DslEditor text                                                                            |
| **Undo (Ctrl+Z)**    | Keyboard handler → `historyStore.undo(currentState)` → get `previousState` → `documentStore.set(previousState)`                                              |
| **Export PNG**       | Toolbar click → `export.ts`: clone SVG → apply styles → Canvas API `toBlob()` → download                                                                     |
| **Save**             | Toolbar / Ctrl+S → `documentStore.save(docId)` → `api.saveDocument(id, { nodes, edges })` → `PUT /api/documents/:id`                                         |
| **Sidebar drag**     | Drag shape from palette → drop on canvas → compute world coords → `documentStore.addNode(newNode)`                                                           |
| **Multi-select**     | Shift+Click or marquee drag → `selectionStore.selectNodes(ids, multi)` → PropertyPanel shows batch props                                                     |
| **Zoom**             | Scroll wheel → `canvasStore.zoom(delta, mousePos)` → SVG transform updates                                                                                   |

---

## 5. Data Flow

### Load Document

```
Route: /editor/[id]
  │
  ├── +page.svelte  onMount
  │     │
  │     └── documentStore.load(id)
  │           │
  │           ├── api.getDocument(id)           ── GET /api/documents/:id
  │           │     └── returns { nodes, edges, title, diagram_type, ... }
  │           │
  │           ├── documentStore.set({ nodes, edges })
  │           └── historyStore.clear()
  │
  └── Canvas.svelte subscribes to $documentStore
        ├── NodeRenderer renders each node
        └── EdgeRenderer renders each edge
```

### Save Document

```
documentStore.save(id)
  │
  ├── Read current state: { nodes, edges }
  ├── api.saveDocument(id, state, title?)     ── PUT /api/documents/:id
  │     body: { content: { nodes, edges }, view: { positions, styles, routing } }
  └── Toast "Saved" on success
```

### DSL ⇄ Canvas Bidirectional Sync

```
                    ┌──────────────────────────────────┐
                    │         documentStore             │
                    │   { nodes: Node[], edges: Edge[] }│
                    └────────┬──────────────┬───────────┘
                             │              │
              ┌──────────────┘              └──────────────┐
              ▼                                            ▼
     serializer.serialize()                      Canvas.svelte
     DocumentState → DSL text                    renders SVG nodes/edges
              │                                            │
              ▼                                            ▼
     DslEditor.svelte                            User drags/edits visually
     displays DSL text                           → store.updateNode/addEdge
              │
              ▼ (user types)
     parser.parse(text) → AST
     transformer.transform(AST) → DocumentState
     documentStore.set(newState)
```

**Sync Guard:** A `syncDirection` flag (`'dsl' | 'canvas' | null`) should be used to prevent infinite loops.
When DSL editor triggers a change, set `syncDirection = 'dsl'`; Canvas subscription skips serializer update.
When canvas triggers a change, set `syncDirection = 'canvas'`; DSL subscription skips parser update.
Reset to `null` after each sync cycle completes.

---

## 6. Autosave Strategy

```
┌────────────────────────────────────────────────────┐
│  Debounced Autosave (3 second delay after last     │
│  mutation, resets on each new mutation)             │
│                                                    │
│  documentStore.subscribe(state => {                │
│      clearTimeout(autosaveTimer);                  │
│      setDirty(true);                               │
│      autosaveTimer = setTimeout(() => {            │
│          documentStore.save(docId);                 │
│          setDirty(false);                           │
│      }, 3000);                                     │
│  });                                               │
│                                                    │
│  Also: beforeunload → warn if dirty               │
│  Also: Ctrl+S → immediate save, clear timer        │
└────────────────────────────────────────────────────┘
```

| Parameter            | Value                              | Rationale                                           |
| -------------------- | ---------------------------------- | --------------------------------------------------- |
| Debounce delay       | 3000ms                             | Batches rapid edits (drag operations) into one save |
| Dirty indicator      | Toolbar shows `●` dot when unsaved | User awareness                                      |
| `beforeunload` guard | Warn if dirty                      | Prevent accidental data loss                        |
| Manual save (Ctrl+S) | Immediate, clears timer            | User certainty                                      |

---

## 7. Optimistic Update Strategy

All mutations will be **local-first, persist-later**:

```
User action
  │
  ├── 1. historyStore.push(currentState)     ← save for undo
  ├── 2. documentStore.update(...)           ← immediate UI update (optimistic)
  ├── 3. Svelte re-renders Canvas            ← user sees change instantly
  └── 4. Autosave timer → API call           ← async persist (debounced)
         │
         ├── Success → setDirty(false), Toast (optional)
         └── Failure → Toast error, keep dirty flag, retry on next trigger
```

**Why this works for MVP (single-user):**

- No conflict resolution needed — only one user edits at a time
- Undo/redo is fully local (history stack in memory)
- Network latency is hidden — user never waits for API response
- Failed saves are retried on next autosave cycle; data stays in memory

**Phase 3 upgrade path:**
When WebSocket collaboration is added, optimistic updates will be wrapped with operation IDs.
Server-authoritative versioning + node-level locking will resolve conflicts.
A `collaborationStore` placeholder should be created early to simplify this transition.

---

## 8. Component Responsibility Matrix

| Component                | Reads Store                 | Writes Store                       | Props        |
| ------------------------ | --------------------------- | ---------------------------------- | ------------ |
| `Canvas.svelte`          | document, canvas, selection | canvas (pan/zoom)                  | —            |
| `NodeWrapper.svelte`     | selection                   | document (position), selection     | node: Node   |
| `NodeRenderer.svelte`    | —                           | —                                  | node: Node   |
| `EdgeRenderer.svelte`    | canvas                      | document (edge update)             | edge: Edge   |
| `Toolbar.svelte`         | history, canvas             | history (undo/redo), canvas (zoom) | docId, title |
| `Sidebar.svelte`         | —                           | document (addNode)                 | diagramType  |
| `PropertyPanel.svelte`   | document, selection         | document (updateNode/Edge)         | —            |
| `DslEditor.svelte`       | document                    | document (set from parsed DSL)     | —            |
| `Minimap.svelte`         | document, canvas            | canvas (pan on click)              | —            |
| `SelectionBox.svelte`    | —                           | selection (selectNodes)            | —            |
| `FloatingToolbar.svelte` | selection                   | document (delete, copy, order)     | —            |
