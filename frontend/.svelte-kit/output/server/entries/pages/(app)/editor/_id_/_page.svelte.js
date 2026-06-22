import "clsx";
import { s as store_get, a as attr, u as unsubscribe_stores, b as stringify, c as bind_props, d as attr_class, f as attr_style, e as ensure_array_like } from "../../../../../chunks/index2.js";
import { w as writable, g as get } from "../../../../../chunks/index.js";
import { a as api } from "../../../../../chunks/client2.js";
import { a as MAX_HISTORY_SIZE, M as Modal, N as NODE_SHAPES } from "../../../../../chunks/constants.js";
import { a as ssr_context, e as escape_html } from "../../../../../chunks/context.js";
import { B as Button } from "../../../../../chunks/Button.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
const documentsApi = {
  /** List documents in a project (metadata only, no content/view) */
  listByProject: (projectId, params) => {
    const queryParams = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.per_page) queryParams.per_page = String(params.per_page);
    if (params?.diagram_type) queryParams.diagram_type = params.diagram_type;
    if (params?.sort_by) queryParams.sort_by = params.sort_by;
    if (params?.sort_order) queryParams.sort_order = params.sort_order;
    return api.get(`/projects/${projectId}/documents`, {
      params: Object.keys(queryParams).length > 0 ? queryParams : void 0
    });
  },
  /** Get a single document with full content and view */
  get: (id) => api.get(`/documents/${id}`),
  /** Create a new document */
  create: (data) => api.post("/documents", data),
  /** Update document title, content, and/or view */
  update: (id, data) => api.put(`/documents/${id}`, data),
  /** Delete a document */
  delete: (id) => api.delete(`/documents/${id}`),
  /** Get recent documents across all workspaces (limit 10) */
  recent: (limit = 10) => api.get("/documents/recent", {
    params: { limit: String(limit) }
  })
};
function createCanvasStore() {
  const { subscribe, set, update } = writable({ x: 0, y: 0, k: 1 });
  return {
    subscribe,
    set,
    update,
    pan: (dx, dy) => update((t) => ({ ...t, x: t.x + dx, y: t.y + dy })),
    zoom: (delta, center) => update((t) => {
      const zoomFactor = delta > 0 ? 1.1 : 0.9;
      const newK = Math.min(Math.max(t.k * zoomFactor, 0.1), 5);
      const dx = (center.x - t.x) * (1 - zoomFactor);
      const dy = (center.y - t.y) * (1 - zoomFactor);
      return {
        ...t,
        x: t.x + dx,
        y: t.y + dy,
        k: newK
      };
    }),
    startConnection: (nodeId, handle, mousePos, modifyingEdgeId, isReversed = false) => update((s) => ({
      ...s,
      connecting: {
        sourceNodeId: nodeId,
        sourceHandle: handle,
        mousePos,
        modifyingEdgeId,
        isReversed
      }
    })),
    updateConnection: (mousePos, candidateNodeId) => update(
      (s) => s.connecting ? { ...s, connecting: { ...s.connecting, mousePos, candidateNodeId } } : s
    ),
    endConnection: () => update((s) => {
      const { connecting, ...rest } = s;
      return rest;
    }),
    setZoom: (newK) => update((t) => ({ ...t, k: Math.min(Math.max(newK, 0.1), 5) })),
    reset: () => set({ x: 0, y: 0, k: 1 })
  };
}
const canvasStore = createCanvasStore();
function createHistoryStore() {
  const { subscribe, set, update } = writable({
    past: [],
    future: [],
    canUndo: false,
    canRedo: false
  });
  return {
    subscribe,
    /** Push current state before a mutation */
    push(state) {
      update((h) => {
        const past = [...h.past, state];
        if (past.length > MAX_HISTORY_SIZE) past.shift();
        return {
          past,
          future: [],
          canUndo: true,
          canRedo: false
        };
      });
    },
    /** Undo: pop from past, push current to future */
    undo(currentState) {
      const h = get({ subscribe });
      if (h.past.length === 0) return null;
      const past = [...h.past];
      const previousState = past.pop();
      set({
        past,
        future: [currentState, ...h.future],
        canUndo: past.length > 0,
        canRedo: true
      });
      return previousState;
    },
    /** Redo: pop from future, push current to past */
    redo(currentState) {
      const h = get({ subscribe });
      if (h.future.length === 0) return null;
      const future = [...h.future];
      const nextState = future.shift();
      set({
        past: [...h.past, currentState],
        future,
        canUndo: true,
        canRedo: future.length > 0
      });
      return nextState;
    },
    /** Clear all history */
    clear() {
      set({ past: [], future: [], canUndo: false, canRedo: false });
    }
  };
}
const historyStore = createHistoryStore();
function toDocumentContent(state) {
  return {
    nodes: state.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      label: n.label,
      properties: {
        ...n.data ?? {},
        ...n.width != null ? { width: n.width } : {},
        ...n.height != null ? { height: n.height } : {},
        ...n.locked != null ? { locked: n.locked } : {},
        ...n.rotation != null ? { rotation: n.rotation } : {}
      }
    })),
    edges: state.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: e.type
    }))
  };
}
function toDocumentView(state) {
  const positions = {};
  const styles = {};
  const routing = {};
  for (const node of state.nodes) {
    positions[node.id] = { x: node.position.x, y: node.position.y };
    if (node.style || node.color) {
      styles[node.id] = { ...node.style ?? {}, ...node.color ? { color: node.color } : {} };
    }
  }
  for (const edge of state.edges) {
    const edgeRouting = {};
    if (edge.waypoints) edgeRouting.waypoints = edge.waypoints;
    if (edge.animated != null) edgeRouting.animated = edge.animated;
    if (edge.style) edgeRouting.style = edge.style;
    if (edge.markerStart) edgeRouting.markerStart = edge.markerStart;
    if (edge.markerEnd) edgeRouting.markerEnd = edge.markerEnd;
    if (Object.keys(edgeRouting).length > 0) {
      routing[edge.id] = edgeRouting;
    }
  }
  return { positions, styles, routing };
}
function fromApiDocument(content, view) {
  const nodes = content.nodes.map((cn) => {
    const pos = view.positions?.[cn.id] ?? { x: 0, y: 0 };
    const nodeStyle = view.styles?.[cn.id];
    const props = cn.properties ?? {};
    return {
      id: cn.id,
      type: cn.type,
      position: { x: pos.x, y: pos.y },
      label: cn.label,
      ...props.width != null ? { width: props.width } : {},
      ...props.height != null ? { height: props.height } : {},
      ...props.locked != null ? { locked: props.locked } : {},
      ...props.rotation != null ? { rotation: props.rotation } : {},
      ...nodeStyle ? { style: nodeStyle } : {},
      data: Object.fromEntries(
        Object.entries(props).filter(([k]) => !["width", "height", "locked", "rotation"].includes(k))
      )
    };
  });
  const edges = content.edges.map((ce) => {
    const edgeRouting = view.routing?.[ce.id] ?? {};
    return {
      id: ce.id,
      source: ce.source,
      target: ce.target,
      label: ce.label,
      type: ce.type,
      ...edgeRouting.waypoints ? { waypoints: edgeRouting.waypoints } : {},
      ...edgeRouting.animated != null ? { animated: edgeRouting.animated } : {},
      ...edgeRouting.style ? { style: edgeRouting.style } : {},
      ...edgeRouting.markerStart ? { markerStart: edgeRouting.markerStart } : {},
      ...edgeRouting.markerEnd ? { markerEnd: edgeRouting.markerEnd } : {}
    };
  });
  return { nodes, edges };
}
const emptyState = { nodes: [], edges: [] };
const initialState = {
  nodes: [
    { id: "1", type: "start-end", position: { x: 100, y: 100 }, label: "Start" },
    { id: "2", type: "process", position: { x: 100, y: 200 }, label: "Process Check" },
    { id: "3", type: "decision", position: { x: 100, y: 300 }, label: "Is Valid?" },
    { id: "4", type: "start-end", position: { x: 100, y: 500 }, label: "End" }
  ],
  edges: [
    { id: "e1", source: "1", target: "2" },
    { id: "e2", source: "2", target: "3" }
  ]
};
function createDocumentStore() {
  const { subscribe, set, update } = writable(initialState);
  const saveHistory = (currentState) => {
    historyStore.push(currentState);
  };
  return {
    subscribe,
    set,
    update,
    /** Load document from API by ID, populating store from content+view */
    load: async (id) => {
      try {
        const doc = await documentsApi.get(id);
        if (doc) {
          const state = fromApiDocument(doc.content, doc.view);
          set(state);
          historyStore.clear();
          return true;
        }
        return false;
      } catch (e) {
        console.error("[documentStore] load error:", e);
        return false;
      }
    },
    /** Save current store state to API, splitting into content+view */
    save: async (id, title) => {
      try {
        const currentState = get({ subscribe });
        const payload = {
          content: toDocumentContent(currentState),
          view: toDocumentView(currentState),
          ...title ? { title } : {}
        };
        await documentsApi.update(id, payload);
      } catch (e) {
        console.error("[documentStore] save error:", e);
        throw e;
      }
    },
    /** Reset store to empty state */
    clear: () => {
      set(emptyState);
      historyStore.clear();
    },
    // Node Actions
    addNode: (node) => {
      update((state) => {
        saveHistory(state);
        return { ...state, nodes: [...state.nodes, node] };
      });
    },
    updateNode: (id, data) => {
      update((state) => {
        saveHistory(state);
        return {
          ...state,
          nodes: state.nodes.map((n) => n.id === id ? { ...n, ...data } : n)
        };
      });
    },
    removeNode: (id) => {
      update((state) => {
        saveHistory(state);
        return {
          ...state,
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id)
        };
      });
    },
    moveNodeOrder: (id, direction) => {
      update((state) => {
        saveHistory(state);
        const nodeIndex = state.nodes.findIndex((n) => n.id === id);
        if (nodeIndex === -1) return state;
        const node = state.nodes[nodeIndex];
        const newNodes = [...state.nodes];
        newNodes.splice(nodeIndex, 1);
        if (direction === "front") {
          newNodes.push(node);
        } else {
          newNodes.unshift(node);
        }
        return { ...state, nodes: newNodes };
      });
    },
    // Edge Actions
    addEdge: (edge) => {
      update((state) => {
        saveHistory(state);
        return { ...state, edges: [...state.edges, edge] };
      });
    },
    updateEdge: (id, data) => {
      update((state) => {
        saveHistory(state);
        return {
          ...state,
          edges: state.edges.map((e) => e.id === id ? { ...e, ...data } : e)
        };
      });
    },
    removeEdge: (id) => {
      update((state) => {
        saveHistory(state);
        return { ...state, edges: state.edges.filter((e) => e.id !== id) };
      });
    }
  };
}
const documentStore = createDocumentStore();
function createSelectionStore() {
  const { subscribe, set, update } = writable({
    nodes: [],
    edges: []
  });
  return {
    subscribe,
    selectNode: (id, multi = false) => update((s) => ({
      nodes: multi ? s.nodes.includes(id) ? s.nodes.filter((n) => n !== id) : [...s.nodes, id] : [id],
      edges: multi ? s.edges : []
    })),
    selectEdge: (id, multi = false) => update((s) => ({
      nodes: multi ? s.nodes : [],
      edges: multi ? s.edges.includes(id) ? s.edges.filter((e) => e !== id) : [...s.edges, id] : [id]
    })),
    selectNodes: (ids, multi = false) => update((s) => ({
      nodes: multi ? [.../* @__PURE__ */ new Set([...s.nodes, ...ids])] : ids,
      edges: multi ? s.edges : []
    })),
    clear: () => set({ nodes: [], edges: [] })
  };
}
const selectionStore = createSelectionStore();
function Grid($$renderer) {
  var $$store_subs;
  let patternSize, offsetX, offsetY;
  const gridSize = 20;
  let transform = store_get($$store_subs ??= {}, "$canvasStore", canvasStore);
  transform = store_get($$store_subs ??= {}, "$canvasStore", canvasStore);
  patternSize = gridSize * transform.k;
  offsetX = transform.x % patternSize;
  offsetY = transform.y % patternSize;
  $$renderer.push(`<defs><pattern id="grid-pattern"${attr("width", patternSize)}${attr("height", patternSize)} patternUnits="userSpaceOnUse"${attr("x", offsetX)}${attr("y", offsetY)}><circle${attr("cx", 1.5)}${attr("cy", 1.5)}${attr("r", 1.5)} fill="#334155"></circle></pattern></defs><rect width="100%" height="100%" fill="url(#grid-pattern)" class="pointer-events-none"></rect>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
}
function getSmoothPath(source, target, sourcePosition = "bottom", targetPosition = "top") {
  const deltaX = Math.abs(target.x - source.x);
  const deltaY = Math.abs(target.y - source.y);
  const controlPointDistance = Math.min(deltaX * 0.5, 150) + Math.min(deltaY * 0.5, 150);
  const getControlPoint = (pos, dir, dist) => {
    switch (dir) {
      case "top":
        return { x: pos.x, y: pos.y - dist };
      case "right":
        return { x: pos.x + dist, y: pos.y };
      case "bottom":
        return { x: pos.x, y: pos.y + dist };
      case "left":
        return { x: pos.x - dist, y: pos.y };
    }
  };
  const cp1 = getControlPoint(source, sourcePosition, controlPointDistance);
  const cp2 = getControlPoint(target, targetPosition, controlPointDistance);
  return `M ${source.x} ${source.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${target.x} ${target.y}`;
}
function getNodeBoundaryPoint(node, targetPoint) {
  const w = node.width || 120;
  const h = node.height || 60;
  const cx = node.position.x + w / 2;
  const cy = node.position.y + h / 2;
  const dx = targetPoint.x - cx;
  const dy = targetPoint.y - cy;
  if (dx === 0 && dy === 0) {
    return { x: cx, y: cy };
  }
  const w2 = w / 2;
  const h2 = h / 2;
  if (node.type === "decision") {
    const t2 = 1 / (Math.abs(dx) / w2 + Math.abs(dy) / h2);
    return {
      x: cx + t2 * dx,
      y: cy + t2 * dy
    };
  }
  if (node.type === "usecase" || node.type === "start-end") {
    const t2 = 1 / Math.sqrt(dx * dx / (w2 * w2) + dy * dy / (h2 * h2));
    return {
      x: cx + t2 * dx,
      y: cy + t2 * dy
    };
  }
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const tx = absDx > 0 ? w2 / absDx : Infinity;
  const ty = absDy > 0 ? h2 / absDy : Infinity;
  const t = Math.min(tx, ty);
  return {
    x: cx + t * dx,
    y: cy + t * dy
  };
}
function Canvas($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children, svgElement = void 0 } = $$props;
    let transform = store_get($$store_subs ??= {}, "$canvasStore", canvasStore);
    $$renderer2.push(`<div class="relative h-full w-full overflow-hidden bg-slate-900"><svg class="block h-full w-full cursor-crosshair touch-none active:cursor-grabbing" role="application" aria-label="Diagram Canvas">`);
    Grid($$renderer2);
    $$renderer2.push(`<!----><g${attr("transform", `translate(${stringify(store_get($$store_subs ??= {}, "$canvasStore", canvasStore).x)} ${stringify(store_get($$store_subs ??= {}, "$canvasStore", canvasStore).y)}) scale(${stringify(store_get($$store_subs ??= {}, "$canvasStore", canvasStore).k)})`)}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!---->`);
    if (store_get($$store_subs ??= {}, "$canvasStore", canvasStore).connecting) {
      $$renderer2.push("<!--[-->");
      const conn = store_get($$store_subs ??= {}, "$canvasStore", canvasStore).connecting;
      const startNode = store_get($$store_subs ??= {}, "$documentStore", documentStore).nodes.find((n) => n.id === conn.sourceNodeId);
      if (startNode) {
        $$renderer2.push("<!--[-->");
        const startPos = {
          x: startNode.position.x + (conn.sourceHandle === "left" ? 0 : conn.sourceHandle === "right" ? startNode.width || 120 : (startNode.width || 120) / 2),
          y: startNode.position.y + (conn.sourceHandle === "top" ? 0 : conn.sourceHandle === "bottom" ? startNode.height || 60 : (startNode.height || 60) / 2)
        };
        $$renderer2.push(`<path${attr("d", getSmoothPath(startPos, conn.mousePos, conn.sourceHandle, "top"))} class="pointer-events-none stroke-indigo-500 stroke-2" stroke-dasharray="5,5" fill="none"></path>`);
        if (conn.candidateNodeId) {
          $$renderer2.push("<!--[-->");
          const targetNode = store_get($$store_subs ??= {}, "$documentStore", documentStore).nodes.find((n) => n.id === conn.candidateNodeId);
          if (targetNode) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<rect${attr("x", targetNode.position.x - 4)}${attr("y", targetNode.position.y - 4)}${attr("width", (targetNode.width || 120) + 8)}${attr("height", (targetNode.height || 60) + 8)} rx="8" class="dashed pointer-events-none fill-none stroke-indigo-400 stroke-2" stroke-dasharray="4"></rect>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></g></svg> <div class="absolute right-4 bottom-4 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-300 shadow-lg">${escape_html(Math.round(transform.k * 100))}%</div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { svgElement });
  });
}
function NodeWrapper($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { node, children } = $$props;
    let isSelected = store_get($$store_subs ??= {}, "$selectionStore", selectionStore).nodes.includes(node.id);
    $$renderer2.push(`<g${attr("transform", `translate(${stringify(node.position.x)} ${stringify(node.position.y)}) rotate(${stringify(node.rotation || 0)} ${stringify((node.width || 120) / 2)} ${stringify((node.height || 60) / 2)})`)} class="group cursor-move outline-none" role="group" aria-label="Node">`);
    if (
      // Reconnecting existing edge
      // Dragged source handle -> update source
      // Dragged target handle -> update target
      // Create new edge
      isSelected || store_get($$store_subs ??= {}, "$canvasStore", canvasStore).connecting?.candidateNodeId === node.id
    ) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<rect${attr("x", -4)}${attr("y", -4)}${attr("width", (node.width || 120) + 8)}${attr("height", (node.height || 60) + 8)} rx="8" class="fill-indigo-500/20 stroke-indigo-500 stroke-2 transition-all duration-150"></rect>`);
      if (isSelected) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<rect${attr("x", -8)}${attr("y", -8)}${attr("width", 8)}${attr("height", 8)} class="pointer-events-auto cursor-nw-resize fill-indigo-500 stroke-white stroke-1"></rect><rect${attr("x", node.width || 120)}${attr("y", -8)}${attr("width", 8)}${attr("height", 8)} class="pointer-events-auto cursor-ne-resize fill-indigo-500 stroke-white stroke-1"></rect><rect${attr("x", -8)}${attr("y", node.height || 60)}${attr("width", 8)}${attr("height", 8)} class="pointer-events-auto cursor-sw-resize fill-indigo-500 stroke-white stroke-1"></rect><rect${attr("x", node.width || 120)}${attr("y", node.height || 60)}${attr("width", 8)}${attr("height", 8)} class="pointer-events-auto cursor-se-resize fill-indigo-500 stroke-white stroke-1"></rect><rect${attr("x", (node.width || 120) / 2 - 4)}${attr("y", -28)}${attr("width", 8)}${attr("height", 8)}${attr("rx", 4)} class="pointer-events-auto cursor-crosshair fill-white stroke-indigo-500 stroke-2 hover:fill-indigo-500 transition-colors"></rect><line${attr("x1", (node.width || 120) / 2)}${attr("y1", -20)}${attr("x2", (node.width || 120) / 2)}${attr("y2", -8)} class="pointer-events-none stroke-indigo-500 stroke-1"></line>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    children?.($$renderer2);
    $$renderer2.push(`<!---->`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--><foreignObject${attr("x", -6)}${attr("y", -6)}${attr("width", (node.width || 120) + 12)}${attr("height", (node.height || 60) + 12)} class="pointer-events-none overflow-visible"><div${attr_class(`relative h-full w-full opacity-0 transition-opacity group-hover:opacity-100 ${stringify(isSelected ? "opacity-100" : "")}`)}><div class="pointer-events-auto absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 cursor-crosshair rounded-full border border-white bg-indigo-500 shadow-sm transition-transform hover:scale-125" role="button" tabindex="0" aria-label="Connect Top"></div> <div class="pointer-events-auto absolute top-1/2 -right-1 h-3 w-3 -translate-y-1/2 cursor-crosshair rounded-full border border-white bg-indigo-500 shadow-sm transition-transform hover:scale-125" role="button" tabindex="0" aria-label="Connect Right"></div> <div class="pointer-events-auto absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 cursor-crosshair rounded-full border border-white bg-indigo-500 shadow-sm transition-transform hover:scale-125" role="button" tabindex="0" aria-label="Connect Bottom"></div> <div class="pointer-events-auto absolute top-1/2 -left-1 h-3 w-3 -translate-y-1/2 cursor-crosshair rounded-full border border-white bg-indigo-500 shadow-sm transition-transform hover:scale-125" role="button" tabindex="0" aria-label="Connect Left"></div></div></foreignObject></g>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function ProcessNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const styleMap = {
      slate: "fill: #1e293b; stroke: #475569;",
      red: "fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;",
      green: "fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;",
      amber: "fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;",
      indigo: "fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;",
      cyan: "fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;"
    };
    let styleStr = styleMap[node.color || "slate"] || styleMap.slate;
    $$renderer2.push(`<g class="group"><rect${attr("width", node.width || 120)}${attr("height", node.height || 60)} rx="6" class="stroke-2 transition-colors group-hover:!stroke-indigo-400"${attr_style(styleStr)}></rect><text${attr("x", (node.width || 120) / 2)}${attr("y", (node.height || 60) / 2)} dominant-baseline="middle" text-anchor="middle" class="pointer-events-none text-sm font-medium select-none" style="fill: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500;">${escape_html(node.label)}</text></g>`);
  });
}
function DecisionNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const styleMap = {
      slate: "fill: #1e293b; stroke: #475569;",
      red: "fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;",
      green: "fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;",
      amber: "fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;",
      indigo: "fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;",
      cyan: "fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;"
    };
    let width = node.width || 100;
    let height = node.height || 100;
    let halfW = (node.width || 100) / 2;
    let halfH = (node.height || 100) / 2;
    let styleStr = styleMap[node.color || "slate"] || styleMap.slate;
    $$renderer2.push(`<g class="group"><polygon${attr("points", `${stringify(halfW)},0 ${stringify(width)},${stringify(halfH)} ${stringify(halfW)},${stringify(height)} 0,${stringify(halfH)}`)} class="stroke-2 transition-colors group-hover:!stroke-indigo-400"${attr_style(styleStr)}></polygon><text${attr("x", halfW)}${attr("y", halfH)} dominant-baseline="middle" text-anchor="middle" class="pointer-events-none text-sm font-medium select-none" style="fill: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500;">${escape_html(node.label)}</text></g>`);
  });
}
function StartEndNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const styleMap = {
      slate: "fill: #1e293b; stroke: #475569;",
      red: "fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;",
      green: "fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;",
      amber: "fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;",
      indigo: "fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;",
      cyan: "fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;"
    };
    let width = node.width || 100;
    let height = node.height || 50;
    let styleStr = styleMap[node.color || "slate"] || styleMap.slate;
    $$renderer2.push(`<g class="group"><rect${attr("width", width)}${attr("height", height)}${attr("rx", height / 2)} class="stroke-2 transition-colors group-hover:!stroke-indigo-400"${attr_style(styleStr)}></rect><text${attr("x", width / 2)}${attr("y", height / 2)} dominant-baseline="middle" text-anchor="middle" class="pointer-events-none text-sm font-medium select-none" style="fill: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500;">${escape_html(node.label)}</text></g>`);
  });
}
function EntityNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    let w = node.width || 120;
    let h = node.height || 80;
    const themes = {
      slate: {
        bodyFill: "#1e293b",
        bodyStroke: "#475569",
        headerFill: "rgba(148, 163, 184, 0.2)",
        dividerStroke: "rgba(148, 163, 184, 0.3)",
        labelFill: "#94a3b8"
      },
      red: {
        bodyFill: "#1e293b",
        bodyStroke: "rgba(239, 68, 68, 0.6)",
        headerFill: "rgba(239, 68, 68, 0.2)",
        dividerStroke: "rgba(239, 68, 68, 0.3)",
        labelFill: "#f87171"
      },
      green: {
        bodyFill: "#1e293b",
        bodyStroke: "rgba(16, 185, 129, 0.6)",
        headerFill: "rgba(16, 185, 129, 0.2)",
        dividerStroke: "rgba(16, 185, 129, 0.3)",
        labelFill: "#34d399"
      },
      amber: {
        bodyFill: "#1e293b",
        bodyStroke: "rgba(251, 191, 36, 0.6)",
        headerFill: "rgba(251, 191, 36, 0.2)",
        dividerStroke: "rgba(251, 191, 36, 0.3)",
        labelFill: "#fbbf24"
      },
      indigo: {
        bodyFill: "#1e293b",
        bodyStroke: "rgba(99, 102, 241, 0.6)",
        headerFill: "rgba(99, 102, 241, 0.2)",
        dividerStroke: "rgba(99, 102, 241, 0.3)",
        labelFill: "#818cf8"
      },
      cyan: {
        bodyFill: "#1e293b",
        bodyStroke: "rgba(6, 182, 212, 0.6)",
        headerFill: "rgba(6, 182, 212, 0.2)",
        dividerStroke: "rgba(6, 182, 212, 0.3)",
        labelFill: "#22d3ee"
      }
    };
    let theme = themes[node.color || "green"] || themes.green;
    $$renderer2.push(`<g><rect x="2" y="2"${attr("width", w)}${attr("height", h)} rx="4" style="fill: rgba(0,0,0,0.2);"></rect><rect${attr("width", w)}${attr("height", h)} rx="4"${attr_style(`fill: ${stringify(theme.bodyFill)}; stroke: ${stringify(theme.bodyStroke)}; stroke-width: 1.5;`)}></rect><rect${attr("width", w)}${attr("height", 24)} rx="4"${attr_style(`fill: ${stringify(theme.headerFill)};`)}></rect><rect y="20"${attr("width", w)} height="4"${attr_style(`fill: ${stringify(theme.headerFill)};`)}></rect><line x1="0" y1="24"${attr("x2", w)} y2="24"${attr_style(`stroke: ${stringify(theme.dividerStroke)}; stroke-width: 1;`)}></line><text${attr("x", w / 2)}${attr("y", 16)} text-anchor="middle" class="text-[11px] font-bold select-none"${attr_style(`fill: ${stringify(theme.labelFill)}; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 700;`)}>${escape_html(node.label)}</text>`);
    if (node.data?.attributes && node.data.attributes.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(node.data.attributes);
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let attr$1 = each_array[i];
        $$renderer2.push(`<text x="10"${attr("y", 36 + i * 14)} class="text-[10px] select-none"${attr_style(`fill: ${stringify(theme.bodyStroke)}; font-family: monospace; font-size: 10px;`)}>${escape_html(attr$1)}</text>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<text${attr("x", w / 2)}${attr("y", 24 + (h - 24) / 2 + 4)} text-anchor="middle" class="text-[10px] italic select-none" style="fill: #64748b; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; font-style: italic;">(attributes)</text>`);
    }
    $$renderer2.push(`<!--]--></g>`);
  });
}
function ActorNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    let w = node.width || 60;
    let h = node.height || 90;
    let cx = w / 2;
    const styleMap = {
      slate: "fill: #1e293b; stroke: rgba(251, 191, 36, 0.7);",
      red: "fill: rgba(127, 29, 29, 0.4); stroke: #f87171;",
      green: "fill: rgba(20, 83, 45, 0.4); stroke: #4ade80;",
      amber: "fill: rgba(120, 53, 15, 0.4); stroke: #fbbf24;",
      indigo: "fill: rgba(49, 46, 129, 0.4); stroke: #818cf8;",
      cyan: "fill: rgba(22, 78, 99, 0.4); stroke: #22d3ee;"
    };
    let styleStr = styleMap[node.color || "slate"] || styleMap.slate;
    $$renderer2.push(`<g${attr_style(`${stringify(styleStr)} stroke-width: 1.5;`)}><circle${attr("cx", cx)} cy="12" r="8"></circle><line${attr("x1", cx)} y1="20"${attr("x2", cx)} y2="46"></line><line${attr("x1", cx - 16)} y1="30"${attr("x2", cx + 16)} y2="30"></line><line${attr("x1", cx)} y1="46"${attr("x2", cx - 12)} y2="62"></line><line${attr("x1", cx)} y1="46"${attr("x2", cx + 12)} y2="62"></line><text${attr("x", cx)}${attr("y", h - 2)} text-anchor="middle" class="text-[10px] font-medium select-none" style="fill: #cbd5e1; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; font-weight: 500; stroke: none;">${escape_html(node.label)}</text></g>`);
  });
}
function AttributeNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const styleMap = {
      slate: "fill: #1e293b; stroke: #475569;",
      red: "fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;",
      green: "fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;",
      amber: "fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;",
      indigo: "fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;",
      cyan: "fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;"
    };
    let styleStr = styleMap[node.color || "slate"] || styleMap.slate;
    let rx = (node.width || 120) / 2;
    let ry = (node.height || 60) / 2;
    $$renderer2.push(`<g class="group"><ellipse${attr("cx", rx)}${attr("cy", ry)}${attr("rx", rx)}${attr("ry", ry)} class="stroke-2 transition-colors group-hover:!stroke-indigo-400"${attr_style(styleStr)}></ellipse><text${attr("x", rx)}${attr("y", ry)} dominant-baseline="middle" text-anchor="middle" class="pointer-events-none text-sm font-medium select-none" style="fill: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500;">${escape_html(node.label)}</text></g>`);
  });
}
function RelationshipNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const styleMap = {
      slate: "fill: #1e293b; stroke: #475569;",
      red: "fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;",
      green: "fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;",
      amber: "fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;",
      indigo: "fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;",
      cyan: "fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;"
    };
    let styleStr = styleMap[node.color || "slate"] || styleMap.slate;
    let w = node.width || 120;
    let h = node.height || 60;
    let points = `${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`;
    $$renderer2.push(`<g class="group"><polygon${attr("points", points)} class="stroke-2 transition-colors group-hover:!stroke-indigo-400"${attr_style(styleStr)}></polygon><text${attr("x", w / 2)}${attr("y", h / 2)} dominant-baseline="middle" text-anchor="middle" class="pointer-events-none text-sm font-medium select-none" style="fill: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500;">${escape_html(node.label)}</text></g>`);
  });
}
function UseCaseNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const styleMap = {
      slate: "fill: #1e293b; stroke: #475569;",
      red: "fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;",
      green: "fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;",
      amber: "fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;",
      indigo: "fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;",
      cyan: "fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;"
    };
    let styleStr = styleMap[node.color || "slate"] || styleMap.slate;
    let rx = (node.width || 120) / 2;
    let ry = (node.height || 60) / 2;
    $$renderer2.push(`<g class="group"><ellipse${attr("cx", rx)}${attr("cy", ry)}${attr("rx", rx)}${attr("ry", ry)} class="stroke-2 transition-colors group-hover:!stroke-indigo-400"${attr_style(styleStr)}></ellipse><text${attr("x", rx)}${attr("y", ry)} dominant-baseline="middle" text-anchor="middle" class="pointer-events-none text-sm font-medium select-none" style="fill: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500;">${escape_html(node.label)}</text></g>`);
  });
}
function LifelineNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const styleMap = {
      slate: "fill: #1e293b; stroke: #475569;",
      red: "fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;",
      green: "fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;",
      amber: "fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;",
      indigo: "fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;",
      cyan: "fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;"
    };
    let styleStr = styleMap[node.color || "slate"] || styleMap.slate;
    let w = node.width || 120;
    let h = node.height || 300;
    let headH = 50;
    $$renderer2.push(`<g class="group"><rect${attr("width", w)}${attr("height", headH)} rx="4" class="stroke-2 transition-colors group-hover:!stroke-indigo-400"${attr_style(styleStr)}></rect><text${attr("x", w / 2)}${attr("y", headH / 2)} dominant-baseline="middle" text-anchor="middle" class="pointer-events-none text-sm font-medium select-none" style="fill: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500;">${escape_html(node.label)}</text><line${attr("x1", w / 2)}${attr("y1", headH)}${attr("x2", w / 2)}${attr("y2", h)} stroke="currentColor" stroke-width="2" stroke-dasharray="8 8" class="text-slate-500"></line></g>`);
  });
}
function TextNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    $$renderer2.push(`<foreignObject${attr("width", node.width || 120)}${attr("height", node.height || 60)}><div class="flex h-full w-full items-center justify-center p-1"><div class="text-center font-medium whitespace-pre-wrap text-slate-200 select-none" style="font-size: 14px; line-height: 1.2;">${escape_html(node.label || "Text")}</div></div></foreignObject>`);
  });
}
function InputOutputNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const styleMap = {
      slate: "fill: #1e293b; stroke: #475569;",
      red: "fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;",
      green: "fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;",
      amber: "fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;",
      indigo: "fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;",
      cyan: "fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;"
    };
    let styleStr = styleMap[node.color || "slate"] || styleMap.slate;
    let w = node.width || 120;
    let h = node.height || 60;
    let skew = 20;
    let points = `${skew},0 ${w},0 ${w - skew},${h} 0,${h}`;
    $$renderer2.push(`<g class="group"><polygon${attr("points", points)} class="stroke-2 transition-colors group-hover:!stroke-indigo-400"${attr_style(styleStr)}></polygon><text${attr("x", w / 2)}${attr("y", h / 2)} dominant-baseline="middle" text-anchor="middle" class="pointer-events-none text-sm font-medium select-none" style="fill: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500;">${escape_html(node.label)}</text></g>`);
  });
}
function DatabaseNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const styleMap = {
      slate: "fill: #1e293b; stroke: #475569;",
      red: "fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;",
      green: "fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;",
      amber: "fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;",
      indigo: "fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;",
      cyan: "fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;"
    };
    let styleStr = styleMap[node.color || "slate"] || styleMap.slate;
    let w = node.width || 120;
    let h = node.height || 60;
    let rx = w / 2;
    let ry = 10;
    $$renderer2.push(`<g class="group"><path${attr("d", `M0,${stringify(ry)} L0,${stringify(h - ry)} A${stringify(rx)} ${stringify(ry)} 0 0 0 ${stringify(w)} ${stringify(h - ry)} L${stringify(w)},${stringify(ry)} A${stringify(rx)} ${stringify(ry)} 0 0 0 0 ${stringify(ry)}`)} class="stroke-2 transition-colors group-hover:!stroke-indigo-400"${attr_style(styleStr)}></path><ellipse${attr("cx", w / 2)}${attr("cy", ry)}${attr("rx", w / 2)}${attr("ry", ry)} class="stroke-2 transition-colors group-hover:!stroke-indigo-400"${attr_style(styleStr)}></ellipse><text${attr("x", w / 2)}${attr("y", h / 2)} dominant-baseline="middle" text-anchor="middle" class="pointer-events-none text-sm font-medium select-none" style="fill: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500;">${escape_html(node.label)}</text></g>`);
  });
}
function TriangleNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const styleMap = {
      slate: "fill: #1e293b; stroke: #475569;",
      red: "fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;",
      green: "fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;",
      amber: "fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;",
      indigo: "fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;",
      cyan: "fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;"
    };
    let styleStr = styleMap[node.color || "slate"] || styleMap.slate;
    let w = node.width || 120;
    let h = node.height || 60;
    let points = `${w / 2},0 ${w},${h} 0,${h}`;
    $$renderer2.push(`<g class="group"><polygon${attr("points", points)} class="stroke-2 transition-colors group-hover:!stroke-indigo-400"${attr_style(styleStr)}></polygon><text${attr("x", w / 2)}${attr("y", h * 0.65)} dominant-baseline="middle" text-anchor="middle" class="pointer-events-none text-sm font-medium select-none" style="fill: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500;">${escape_html(node.label)}</text></g>`);
  });
}
function getShapePath(type, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  switch (type) {
    // --- Basic Shapes ---
    case "process":
    case "rectangle":
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
    case "rounded":
    case "start-end":
    case "terminator":
      const r = Math.min(w, h) / 2;
      return `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 ${r} 0 Z`;
    case "decision":
    case "diamond":
    case "relationship":
    case "gateway":
      return `M ${cx} 0 L ${w} ${cy} L ${cx} ${h} L 0 ${cy} Z`;
    case "triangle":
      return `M ${cx} 0 L ${w} ${h} L 0 ${h} Z`;
    case "circle":
    case "ellipse":
    case "start-event":
    case "intermediate-event":
    case "end-event":
    case "attribute":
    case "connector":
    case "interface":
      return `M 0 ${cy} A ${cx} ${cy} 0 1 1 ${w} ${cy} A ${cx} ${cy} 0 1 1 0 ${cy} Z`;
    case "star":
      const points = [];
      for (let i = 0; i < 10; i++) {
        const angle = i * Math.PI / 5 - Math.PI / 2;
        const r2 = i % 2 === 0 ? w / 2 : w / 4;
        points.push(cx + r2 * Math.cos(angle));
        points.push(cy + r2 * Math.sin(angle));
      }
      return `M ${points[0]} ${points[1]} L ` + points.slice(2).reduce((acc, val, i, arr) => {
        if (i % 2 === 0) return acc + `${val} ${arr[i + 1]} L `;
        return acc;
      }, "") + "Z";
    case "hexagon":
    case "preparation":
      return `M ${w * 0.25} 0 L ${w * 0.75} 0 L ${w} ${cy} L ${w * 0.75} ${h} L ${w * 0.25} ${h} L 0 ${cy} Z`;
    case "octagon":
      const o = Math.min(w, h) * 0.3;
      return `M ${o} 0 L ${w - o} 0 L ${w} ${o} L ${w} ${h - o} L ${w - o} ${h} L ${o} ${h} L 0 ${h - o} L 0 ${o} Z`;
    case "parallelogram":
    case "input-output":
      const p = w * 0.2;
      return `M ${p} 0 L ${w} 0 L ${w - p} ${h} L 0 ${h} Z`;
    case "trapezoid":
    case "manual-operation":
      const t = w * 0.2;
      return `M 0 0 L ${w} 0 L ${w - t} ${h} L ${t} ${h} Z`;
    case "cloud":
      return `M ${w * 0.25} ${h * 0.5} 
        Q ${w * 0.1} ${h * 0.2} ${w * 0.4} ${h * 0.3} 
        Q ${w * 0.5} ${h * 0.05} ${w * 0.7} ${h * 0.3} 
        Q ${w * 0.9} ${h * 0.2} ${w * 0.95} ${h * 0.5} 
        Q ${w} ${h * 0.8} ${w * 0.8} ${h * 0.9} 
        Q ${w * 0.6} ${h} ${w * 0.4} ${h * 0.9} 
        Q ${w * 0.1} ${h * 0.9} ${w * 0.05} ${h * 0.6}
        Q ${0} ${h * 0.5} ${w * 0.25} ${h * 0.5} Z`;
    case "note":
      const fold = Math.min(w, h) * 0.2;
      return `M 0 0 L ${w - fold} 0 L ${w} ${fold} L ${w} ${h} L 0 ${h} Z 
        M ${w - fold} 0 L ${w - fold} ${fold} L ${w} ${fold}`;
    case "callout":
      return `M 0 0 L ${w} 0 L ${w} ${h * 0.7} L ${w * 0.4} ${h * 0.7} L ${w * 0.2} ${h} L ${w * 0.3} ${h * 0.7} L 0 ${h * 0.7} Z`;
    case "cross":
      const c = Math.min(w, h) * 0.25;
      return `M ${c} 0 L ${w - c} 0 L ${w - c} ${c} L ${w} ${c} L ${w} ${h - c} L ${w - c} ${h - c} L ${w - c} ${h} L ${c} ${h} L ${c} ${h - c} L 0 ${h - c} L 0 ${c} L ${c} ${c} Z`;
    case "cylinder":
    case "database":
      const dy = h * 0.15;
      return `M 0 ${dy} L 0 ${h - dy} A ${w / 2} ${dy} 0 0 0 ${w} ${h - dy} L ${w} ${dy} A ${w / 2} ${dy} 0 0 0 0 ${dy} Z 
        M 0 ${dy} A ${w / 2} ${dy} 0 0 0 ${w} ${dy}`;
    // Flowchart specific
    case "manual-input":
      const mi = h * 0.2;
      return `M 0 ${mi} L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
    case "delay":
      return `M 0 0 L ${w * 0.8} 0 A ${w * 0.2} ${h / 2} 0 0 1 ${w * 0.8} ${h} L 0 ${h} Z`;
    case "display":
      return `M 0 ${h / 2} L ${w * 0.2} 0 L ${w * 0.8} 0 L ${w} ${h / 2} L ${w * 0.8} ${h} L ${w * 0.2} ${h} Z`;
    case "internal-storage":
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${w * 0.15} 0 L ${w * 0.15} ${h} M ${w * 0.15} ${h * 0.15} L ${w} ${h * 0.15}`;
    case "card":
      return `M 0 ${h * 0.2} L ${w * 0.2} 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
    case "collate":
      return `M 0 0 L ${w} ${h} L 0 ${h} L ${w} 0 Z`;
    case "off-page":
      return `M 0 0 L ${w} 0 L ${w} ${h * 0.8} L ${w * 0.5} ${h} L 0 ${h * 0.8} Z`;
    case "document":
      return `M 0 0 L ${w} 0 L ${w} ${h * 0.85} Q ${w * 0.75} ${h} ${w * 0.5} ${h * 0.85} T 0 ${h * 0.85} Z`;
    case "multi-document":
      return `M 0 0 L ${w} 0 L ${w} ${h * 0.85} Q ${w * 0.75} ${h} ${w * 0.5} ${h * 0.85} T 0 ${h * 0.85} Z`;
    // Simplified
    // UML
    case "actor":
      const headR = w * 0.15;
      const wc = w / 2;
      return `M ${wc} ${headR * 0.5} A ${headR} ${headR} 0 1 1 ${wc} ${headR * 2.5} A ${headR} ${headR} 0 1 1 ${wc} ${headR * 0.5} 
         M ${wc} ${headR * 2.5} L ${wc} ${h * 0.7} 
         M ${wc - w * 0.3} ${h * 0.4} L ${wc + w * 0.3} ${h * 0.4} 
         M ${wc} ${h * 0.7} L ${wc - w * 0.3} ${h} M ${wc} ${h * 0.7} L ${wc + w * 0.3} ${h}`;
    case "usecase":
      return `M 0 ${cy} A ${cx} ${cy} 0 1 1 ${w} ${cy} A ${cx} ${cy} 0 1 1 0 ${cy} Z`;
    case "class":
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M 0 ${h * 0.25} L ${w} ${h * 0.25}`;
    case "package":
      const tabH = h * 0.15;
      const tabW = w * 0.4;
      return `M 0 0 L ${tabW} 0 L ${tabW} ${tabH} L ${w} ${tabH} L ${w} ${h} L 0 ${h} Z M 0 ${tabH} L ${tabW} ${tabH}`;
    // ERD
    case "entity":
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
    case "weak-entity":
      const gap = 4;
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${gap} ${gap} L ${w - gap} ${gap} L ${w - gap} ${h - gap} L ${gap} ${h - gap} Z`;
    // Network
    case "server":
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${w * 0.1} ${h * 0.2} L ${w * 0.9} ${h * 0.2} M ${w * 0.1} ${h * 0.5} L ${w * 0.9} ${h * 0.5} M ${w * 0.1} ${h * 0.8} L ${w * 0.9} ${h * 0.8}`;
    case "cube":
      const dCube = w * 0.25;
      return `M 0 ${dCube} L ${w - dCube} ${dCube} L ${w - dCube} ${h} L 0 ${h} Z M 0 ${dCube} L ${dCube} 0 L ${w} 0 L ${w} ${h - dCube} L ${w - dCube} ${h} M ${w - dCube} ${dCube} L ${w} 0`;
    default:
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
  }
}
function ShapeNode($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const styleMap = {
      slate: { fill: "#1e293b", stroke: "#475569" },
      red: { fill: "rgba(127, 29, 29, 0.4)", stroke: "#ef4444" },
      green: { fill: "rgba(20, 83, 45, 0.4)", stroke: "#22c55e" },
      amber: { fill: "rgba(120, 53, 15, 0.4)", stroke: "#f59e0b" },
      indigo: { fill: "rgba(49, 46, 129, 0.4)", stroke: "#6366f1" },
      cyan: { fill: "rgba(22, 78, 99, 0.4)", stroke: "#06b6d4" },
      white: { fill: "#ffffff", stroke: "#94a3b8" }
    };
    let fallback = (() => styleMap[node.color || "slate"] || styleMap.slate)();
    let w = node.width || 120;
    let h = node.height || 60;
    let d = getShapePath(node.type, w, h);
    let fill = node.style?.fill || fallback.fill;
    let stroke = node.style?.stroke || fallback.stroke;
    let strokeWidth = node.style?.strokeWidth || 2;
    let strokeDasharray = node.style?.strokeDasharray || "none";
    let textColor = node.style?.color || (node.color === "white" ? "#1e293b" : "#e2e8f0");
    let fontSize = node.style?.fontSize || 14;
    let fontFamily = node.style?.fontFamily || "sans-serif";
    let fontWeight = node.style?.fontWeight || "500";
    let filter = node.style?.opacity && node.style.opacity < 1 ? `opacity: ${node.style.opacity}` : "";
    $$renderer2.push(`<g class="group"${attr_style(filter)}><path${attr("d", d)} class="transition-colors group-hover:stroke-indigo-400"${attr("fill", fill)}${attr("stroke", stroke)}${attr("stroke-width", strokeWidth)}${attr("stroke-dasharray", strokeDasharray)} stroke-linejoin="round"></path><foreignObject${attr("x", 0)}${attr("y", 0)}${attr("width", w)}${attr("height", h)} style="pointer-events: none;"><div class="flex h-full w-full items-center justify-center overflow-hidden p-2 text-center break-words"${attr_style(` color: ${stringify(textColor)}; font-family: ${stringify(fontFamily)}; font-size: ${stringify(fontSize)}px; font-weight: ${stringify(fontWeight)}; line-height: 1.2; `)}>${escape_html(node.label)}</div></foreignObject></g>`);
  });
}
function NodeRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const nodeTypes = {
      // Specific Legacy Components (Keep for safety/custom behavior)
      process: ProcessNode,
      decision: DecisionNode,
      "start-end": StartEndNode,
      entity: EntityNode,
      actor: ActorNode,
      attribute: AttributeNode,
      relationship: RelationshipNode,
      usecase: UseCaseNode,
      lifeline: LifelineNode,
      text: TextNode,
      "input-output": InputOutputNode,
      database: DatabaseNode,
      triangle: TriangleNode
      // Explicit mappings to ShapeNode (optional if fallback is ShapeNode, but good for documentation)
      // We can actually remove the Explicit ShapeNode mappings if we use the fallback!
      // But let's leave common ones.
    };
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$documentStore", documentStore).nodes);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let node = each_array[$$index];
      NodeWrapper($$renderer2, {
        node,
        children: ($$renderer3) => {
          if (nodeTypes[node.type]) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push("<!---->");
            nodeTypes[node.type]?.($$renderer3, { node });
            $$renderer3.push(`<!---->`);
          } else {
            $$renderer3.push("<!--[!-->");
            ShapeNode($$renderer3, { node });
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function getStraightPath(points) {
  if (points.length < 2) return "";
  const start = points[0];
  let path = `M ${start.x},${start.y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x},${points[i].y}`;
  }
  return path;
}
function getStepPath(points) {
  if (points.length < 2) return "";
  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = curr.x + (next.x - curr.x) / 2;
    path += ` L ${midX},${curr.y} L ${midX},${next.y} L ${next.x},${next.y}`;
  }
  return path;
}
function getCurvedPath(points, radius = 10) {
  if (points.length < 2) return "";
  if (points.length === 2) {
    const p1 = points[0];
    const p2 = points[1];
    const midY = p1.y + (p2.y - p1.y) / 2;
    return `M ${p1.x},${p1.y} C ${p1.x},${midY} ${p2.x},${midY} ${p2.x},${p2.y}`;
  }
  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = curr.x + (next.x - curr.x) / 2;
    path += ` L ${midX},${curr.y} L ${midX},${next.y} L ${next.x},${next.y}`;
  }
  return path;
}
function getBezierPath(points) {
  if (points.length < 2) return "";
  const start = points[0];
  const end = points[points.length - 1];
  if (points.length === 2) {
    const midY = start.y + (end.y - start.y) / 2;
    return `M ${start.x},${start.y} C ${start.x},${midY} ${end.x},${midY} ${end.x},${end.y}`;
  }
  let path = `M ${start.x},${start.y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = prev.x + (curr.x - prev.x) / 2;
    const midY = prev.y + (curr.y - prev.y) / 2;
    path += ` Q ${prev.x},${prev.y} ${midX},${midY} T ${curr.x},${curr.y}`;
  }
  return path;
}
function getPathByRouting(type, points) {
  switch (type) {
    case "straight":
      return getStraightPath(points);
    case "step":
      return getStepPath(points);
    case "orthogonal":
      return getStepPath(points);
    // Similar to step for now
    case "curved":
      return getCurvedPath(points);
    case "bezier":
    default:
      return getBezierPath(points);
  }
}
function BaseEdge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { edge, sourceNode, targetNode } = $$props;
    let sourceCenter = {
      x: sourceNode.position.x + (sourceNode.width || 120) / 2,
      y: sourceNode.position.y + (sourceNode.height || 60) / 2
    };
    let targetCenter = {
      x: targetNode.position.x + (targetNode.width || 120) / 2,
      y: targetNode.position.y + (targetNode.height || 60) / 2
    };
    let sourcePoint = (() => {
      const targetPointForBoundary = edge.waypoints && edge.waypoints.length > 0 ? edge.waypoints[0] : targetCenter;
      return getNodeBoundaryPoint(sourceNode, targetPointForBoundary);
    })();
    let targetPoint = (() => {
      const sourcePointForBoundary = edge.waypoints && edge.waypoints.length > 0 ? edge.waypoints[edge.waypoints.length - 1] : sourceCenter;
      return getNodeBoundaryPoint(targetNode, sourcePointForBoundary);
    })();
    let isSelected = store_get($$store_subs ??= {}, "$selectionStore", selectionStore).edges.includes(edge.id);
    let strokeColor = isSelected ? "#6366f1" : edge.style?.stroke || "#64748b";
    let strokeWidth = (edge.style?.strokeWidth || 2) + (isSelected ? 1 : 0);
    let strokeDasharray = (() => {
      if (edge.style?.strokeDasharray) return edge.style.strokeDasharray;
      if (edge.animated) return "5,5";
      return "none";
    })();
    let path = (() => {
      const fullPoints = [sourcePoint, ...edge.waypoints || [], targetPoint];
      const rType = edge.type === "default" ? "bezier" : edge.type || "bezier";
      return getPathByRouting(rType, fullPoints);
    })();
    let segments = (() => {
      if (!isSelected) return [];
      const fullPoints = [sourcePoint, ...edge.waypoints || [], targetPoint];
      const segs = [];
      for (let i = 0; i < fullPoints.length - 1; i++) {
        segs.push({
          x: (fullPoints[i].x + fullPoints[i + 1].x) / 2,
          y: (fullPoints[i].y + fullPoints[i + 1].y) / 2,
          index: i
        });
      }
      return segs;
    })();
    let midPoint = (() => {
      if (edge.type === "step") {
        const midX = (sourcePoint.x + targetPoint.x) / 2;
        return { x: midX, y: (sourcePoint.y + targetPoint.y) / 2 };
      } else {
        return {
          x: (sourcePoint.x + targetPoint.x) / 2,
          y: (sourcePoint.y + targetPoint.y) / 2
        };
      }
    })();
    let markerEnd = edge.markerEnd === "none" ? void 0 : edge.markerEnd ? `url(#marker-${edge.markerEnd})` : "url(#arrowhead)";
    $$renderer2.push(`<g class="group" role="button" tabindex="0"><path${attr("d", path)} stroke="transparent" stroke-width="20" fill="none" class="cursor-pointer"></path><path${attr("d", path)}${attr("stroke", strokeColor)}${attr("stroke-width", strokeWidth)}${attr("stroke-dasharray", strokeDasharray)} fill="none"${attr("marker-end", markerEnd)}${attr_class(`transition-colors group-hover:stroke-indigo-400 ${stringify(edge.animated ? "animate-[dash_1s_linear_infinite]" : "")}`)}></path>`);
    if (edge.label) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<rect${attr("x", midPoint.x - edge.label.length * 4 - 4)}${attr("y", midPoint.y - 10)}${attr("width", edge.label.length * 8 + 8)} height="20" rx="4" fill="#0f172a" class="stroke-slate-700"></rect><text${attr("x", midPoint.x)}${attr("y", midPoint.y)} dy="4" text-anchor="middle" class="pointer-events-none fill-slate-300 text-[10px] select-none">${escape_html(edge.label)}</text>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if (isSelected) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(segments);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let seg = each_array[$$index];
        $$renderer2.push(`<circle${attr("cx", seg.x)}${attr("cy", seg.y)} r="4" class="cursor-crosshair fill-indigo-300 stroke-indigo-500 stroke-1 opacity-0 hover:opacity-100 transition-opacity"></circle>`);
      }
      $$renderer2.push(`<!--]-->`);
      if (edge.waypoints) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(edge.waypoints);
        for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
          let wp = each_array_1[i];
          $$renderer2.push(`<circle${attr("cx", wp.x)}${attr("cy", wp.y)} r="5" class="cursor-move fill-indigo-500 stroke-white stroke-2 hover:scale-125 transition-transform"></circle>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></g><defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#64748b"></polygon></marker></defs>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function EdgeRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    function getNode(id) {
      return store_get($$store_subs ??= {}, "$documentStore", documentStore).nodes.find((n) => n.id === id);
    }
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$documentStore", documentStore).edges);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let edge = each_array[$$index];
      const sourceNode = getNode(edge.source);
      const targetNode = getNode(edge.target);
      if (sourceNode && targetNode) {
        $$renderer2.push("<!--[-->");
        BaseEdge($$renderer2, { edge, sourceNode, targetNode });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function EdgeHandleRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    function getNode(id) {
      return store_get($$store_subs ??= {}, "$documentStore", documentStore).nodes.find((n) => n.id === id);
    }
    function getMidpoint(p1, p2) {
      return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    }
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$selectionStore", selectionStore).edges);
    for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
      let edgeId = each_array[$$index_2];
      const edge = store_get($$store_subs ??= {}, "$documentStore", documentStore).edges.find((e) => e.id === edgeId);
      if (edge) {
        $$renderer2.push("<!--[-->");
        const sourceNode = getNode(edge.source);
        const targetNode = getNode(edge.target);
        if (sourceNode && targetNode) {
          $$renderer2.push("<!--[-->");
          const sourceCenter = {
            x: sourceNode.position.x + (sourceNode.width || 120) / 2,
            y: sourceNode.position.y + (sourceNode.height || 60) / 2
          };
          const targetCenter = {
            x: targetNode.position.x + (targetNode.width || 120) / 2,
            y: targetNode.position.y + (targetNode.height || 60) / 2
          };
          const sourcePoint = (() => {
            const targetPointForBoundary = edge.waypoints && edge.waypoints.length > 0 ? edge.waypoints[0] : targetCenter;
            return getNodeBoundaryPoint(sourceNode, targetPointForBoundary);
          })();
          const targetPoint = (() => {
            const sourcePointForBoundary = edge.waypoints && edge.waypoints.length > 0 ? edge.waypoints[edge.waypoints.length - 1] : sourceCenter;
            return getNodeBoundaryPoint(targetNode, sourcePointForBoundary);
          })();
          const points = [sourcePoint, ...edge.waypoints || [], targetPoint];
          $$renderer2.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(points);
          for (let i = 0, $$length2 = each_array_1.length; i < $$length2; i++) {
            let point = each_array_1[i];
            if (i < points.length - 1) {
              $$renderer2.push("<!--[-->");
              const nextPoint = points[i + 1];
              const mid = getMidpoint(point, nextPoint);
              $$renderer2.push(`<circle${attr("cx", mid.x)}${attr("cy", mid.y)} r="5" class="cursor-pointer fill-indigo-400/50 stroke-none transition-all hover:scale-125 hover:fill-indigo-500" aria-label="Add Waypoint" role="button" tabindex="0"></circle>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
          if (edge.waypoints) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<!--[-->`);
            const each_array_2 = ensure_array_like(edge.waypoints);
            for (let i = 0, $$length2 = each_array_2.length; i < $$length2; i++) {
              let point = each_array_2[i];
              $$renderer2.push(`<rect${attr("x", point.x - 4)}${attr("y", point.y - 4)} width="8" height="8" class="cursor-move fill-indigo-500 stroke-white stroke-1 transition-transform hover:scale-125" role="button" tabindex="0" aria-label="Move Waypoint"></rect>`);
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--><circle${attr("cx", sourcePoint.x)}${attr("cy", sourcePoint.y)} r="6" class="cursor-move fill-indigo-500 stroke-white stroke-2 transition-transform hover:scale-125" role="button" tabindex="0" aria-label="Move Source Endpoint"></circle><circle${attr("cx", targetPoint.x)}${attr("cy", targetPoint.y)} r="6" class="cursor-move fill-indigo-500 stroke-white stroke-2 transition-transform hover:scale-125" role="button" tabindex="0" aria-label="Move Target Endpoint"></circle>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function FloatingToolbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let selectedNodes = store_get($$store_subs ??= {}, "$documentStore", documentStore).nodes.filter((n) => store_get($$store_subs ??= {}, "$selectionStore", selectionStore).nodes.includes(n.id));
    let boundingBox = (() => {
      if (selectedNodes.length === 0) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const node of selectedNodes) {
        const w = node.width || 120;
        const h = node.height || 60;
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + w);
        maxY = Math.max(maxY, node.position.y + h);
      }
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    })();
    let toolbarPosition = (() => {
      if (!boundingBox) return { x: 0, y: 0 };
      const { x, y, w } = boundingBox;
      const { x: cx, y: cy, k } = store_get($$store_subs ??= {}, "$canvasStore", canvasStore);
      const screenX = (x + w / 2) * k + cx;
      const screenY = y * k + cy;
      return { x: screenX, y: screenY };
    })();
    if (selectedNodes.length > 0 && boundingBox) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="pointer-events-none absolute z-50 flex -translate-x-1/2 -translate-y-full transform flex-col items-center gap-2 px-4 pb-4"${attr_style(`left: ${stringify(toolbarPosition.x)}px; top: ${stringify(toolbarPosition.y)}px;`)}><div class="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-surface/90 backdrop-blur-md p-1.5 shadow-xl"><div class="flex gap-1"><!--[-->`);
      const each_array = ensure_array_like(["slate", "red", "green", "amber", "indigo", "cyan"]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let color = each_array[$$index];
        $$renderer2.push(`<button${attr_class("h-4 w-4 rounded-full ring-1 ring-white/10 transition-transform hover:scale-110", void 0, {
          "bg-slate-500": color === "slate",
          "bg-red-500": color === "red",
          "bg-green-500": color === "green",
          "bg-amber-500": color === "amber",
          "bg-indigo-500": color === "indigo",
          "bg-cyan-500": color === "cyan"
        })}${attr("aria-label", color)}></button>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="mx-1 h-4 w-px bg-white/10"></div> `);
      if (selectedNodes.length > 1) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="p-1 text-text-tertiary transition-colors hover:bg-white/5 hover:text-white rounded-lg" title="Align Left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22V2"></path><rect width="10" height="6" x="8" y="5"></rect><rect width="10" height="6" x="8" y="15"></rect></svg></button> <button class="p-1 text-text-tertiary transition-colors hover:bg-white/5 hover:text-white rounded-lg" title="Align Center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"></path><rect width="10" height="6" x="7" y="5"></rect><rect width="10" height="6" x="7" y="15"></rect></svg></button> <button class="p-1 text-text-tertiary transition-colors hover:bg-white/5 hover:text-white rounded-lg" title="Align Right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 22V2"></path><rect width="10" height="6" x="6" y="5"></rect><rect width="10" height="6" x="6" y="15"></rect></svg></button> <div class="mx-1 h-4 w-px bg-white/10"></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <button class="p-1 text-text-tertiary transition-colors hover:bg-white/5 hover:text-white rounded-lg" title="Duplicate"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button> <button class="p-1 text-error hover:text-white hover:bg-error/20 rounded-lg transition-colors" title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Toolbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let {
      title = "Untitled",
      diagramType = "flowchart",
      isDirty = false,
      isSaving = false,
      lastSavedAt = null
    } = $$props;
    let showExportModal = false;
    let selection = store_get($$store_subs ??= {}, "$selectionStore", selectionStore);
    let canAlign = selection.nodes.length >= 2;
    selection.nodes.length >= 3;
    function handleSave() {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "s", ctrlKey: true }));
    }
    let zoomPercent = Math.round(store_get($$store_subs ??= {}, "$canvasStore", canvasStore).k * 100);
    $$renderer2.push(`<div class="flex h-14 items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-xl px-4 z-10"><div class="flex items-center gap-3"><a href="/dashboard" class="flex items-center gap-2 text-text-tertiary transition-colors hover:text-white" aria-label="Back to Dashboard"><div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 border border-white/10"><svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg></div></a> <div class="h-6 w-px bg-white/10"></div> `);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<button class="rounded px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-surface/50">${escape_html(title)}</button>`);
    }
    $$renderer2.push(`<!--]--> <span class="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase text-text-secondary">${escape_html(diagramType)}</span> `);
    if (isSaving) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="flex items-center gap-1.5 text-xs text-slate-500 ml-2"><div class="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-transparent"></div> Saving</span>`);
    } else if (isDirty) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<span class="flex items-center gap-1.5 text-xs text-amber-400 ml-2" title="Unsaved changes"><div class="h-2 w-2 rounded-full bg-amber-400"></div> Unsaved</span>`);
    } else if (lastSavedAt) {
      $$renderer2.push("<!--[2-->");
      $$renderer2.push(`<span class="flex items-center gap-1.5 text-xs text-slate-500 ml-2"${attr("title", `Saved at ${stringify(lastSavedAt)}`)}><svg class="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Saved</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-1 bg-surface/50 p-1.5 rounded-xl border border-white/5 shadow-sm"><button class="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"${attr("disabled", !store_get($$store_subs ??= {}, "$historyStore", historyStore).canUndo, true)} aria-label="Undo" title="Undo (Ctrl+Z)"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg></button> <button class="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"${attr("disabled", !store_get($$store_subs ??= {}, "$historyStore", historyStore).canRedo, true)} aria-label="Redo" title="Redo (Ctrl+Shift+Z)"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"></path></svg></button> <div class="mx-1 h-5 w-px bg-white/10"></div> <div${attr_class("flex items-center gap-0.5", void 0, { "opacity-30": !canAlign, "pointer-events-none": !canAlign })}><button class="rounded-lg p-1.5 text-text-tertiary hover:bg-white/5 hover:text-white transition-colors" title="Align Left"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V4M8 6h12M8 12h8M8 18h10"></path></svg></button> <button class="rounded-lg p-1.5 text-text-tertiary hover:bg-white/5 hover:text-white transition-colors" title="Align Center"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v16M4 6h16M6 12h12M4 18h16"></path></svg></button> <button class="rounded-lg p-1.5 text-text-tertiary hover:bg-white/5 hover:text-white transition-colors" title="Align Right"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20V4M4 6h12M8 12h8M6 18h10"></path></svg></button></div> <div class="mx-1 h-5 w-px bg-white/10"></div> <button class="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-white/5 hover:text-white" aria-label="Zoom out"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg></button> <button class="min-w-[48px] rounded-lg px-1.5 py-0.5 text-xs font-medium text-text-secondary transition-colors hover:bg-white/5">${escape_html(zoomPercent)}%</button> <button class="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-white/5 hover:text-white" aria-label="Zoom in"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button></div> <div class="flex items-center gap-2"><button class="rounded-xl p-1.5 text-text-tertiary transition-colors hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10" aria-label="Export" title="Export"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></button> `);
    Button($$renderer2, {
      variant: "primary",
      size: "sm",
      onclick: handleSave,
      disabled: isSaving,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(isSaving ? "Saving..." : "Save Changes")}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div> `);
    Modal($$renderer2, {
      open: showExportModal,
      title: "Export Diagram",
      onclose: () => showExportModal = false,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="grid grid-cols-2 gap-3 p-4"><button class="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-surface/30 p-4 transition-all hover:border-white/20 hover:bg-surface/80 hover:shadow-lg hover:shadow-black/20"><svg class="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> <span class="text-sm font-medium text-white">PNG</span> <span class="text-xs text-slate-400">Raster image</span></button> <button class="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-surface/30 p-4 transition-all hover:border-white/20 hover:bg-surface/80 hover:shadow-lg hover:shadow-black/20"><svg class="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> <span class="text-sm font-medium text-white">JPG</span> <span class="text-xs text-slate-400">Compact image</span></button> <button class="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-surface/30 p-4 transition-all hover:border-white/20 hover:bg-surface/80 hover:shadow-lg hover:shadow-black/20"><svg class="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> <span class="text-sm font-medium text-white">WebP</span> <span class="text-xs text-slate-400">Modern format</span></button> <button class="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-surface/30 p-4 transition-all hover:border-white/20 hover:bg-surface/80 hover:shadow-lg hover:shadow-black/20"><svg class="h-8 w-8 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21H17M12 3v14m0 0l-4-4m4 4l4-4"></path></svg> <span class="text-sm font-medium text-white">SVG</span> <span class="text-xs text-slate-400">Vector image</span></button> <button class="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-surface/30 p-4 transition-all hover:border-white/20 hover:bg-surface/80 hover:shadow-lg hover:shadow-black/20"><svg class="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> <span class="text-sm font-medium text-white">JSON</span> <span class="text-xs text-slate-400">Semantic model</span></button> <button class="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-surface/30 p-4 transition-all hover:border-white/20 hover:bg-surface/80 hover:shadow-lg hover:shadow-black/20"><svg class="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <span class="text-sm font-medium text-white">DSL Text</span> <span class="text-xs text-slate-400">GraDiOl format</span></button></div>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const CATEGORY_NAMES = {
      general: "General",
      flowchart: "Flowchart",
      arrows: "Arrows",
      uml: "UML / Class / Sequence",
      erd: "Entity Relation",
      bpmn: "BPMN 2.0",
      network: "Cloud / Network"
    };
    let searchQuery = "";
    let categories = (() => {
      const allKeys = Object.keys(NODE_SHAPES).filter((k) => k !== "all" && k !== "blank");
      const ORDER = [
        "general",
        "flowchart",
        "arrows",
        "uml",
        "erd",
        "bpmn",
        "network"
      ];
      return allKeys.sort((a, b) => {
        const ia = ORDER.indexOf(a);
        const ib = ORDER.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });
    })();
    let expanded = {
      tools: false,
      general: true,
      flowchart: false,
      arrows: false,
      uml: false,
      erd: false,
      bpmn: false,
      network: false
    };
    function getShapes(cat) {
      let shapes = NODE_SHAPES[cat] || [];
      return shapes;
    }
    $$renderer2.push(`<aside class="z-10 flex h-full w-60 flex-col border-r border-white/5 bg-background/90 backdrop-blur-xl shadow-xl select-none"><div class="space-y-3 border-b border-white/5 px-4 py-3 bg-surface/50"><h3 class="text-[11px] font-bold tracking-wider text-text-tertiary uppercase font-outfit">Shapes</h3> <div class="relative"><svg class="absolute top-1.5 left-2 h-4 w-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> <input type="text" placeholder="Search..."${attr("value", searchQuery)} class="w-full rounded border border-white/5 bg-surface py-1 pr-2 pl-8 text-xs text-text-secondary placeholder-text-tertiary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors"/></div></div> <div class="custom-scrollbar flex-1 overflow-y-auto svelte-l6azji"><div class="border-b border-white/5"><button class="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface/50"><span>General</span> <span class="text-[10px] text-text-tertiary">${escape_html("▶")}</span></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <!--[-->`);
    const each_array = ensure_array_like(categories);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let catKey = each_array[$$index_1];
      if (NODE_SHAPES[catKey]) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="border-b border-white/5"><button class="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface/50"><span>${escape_html(CATEGORY_NAMES[catKey] || catKey)}</span> <span class="text-[10px] text-text-tertiary">${escape_html(expanded[catKey] ? "▼" : "▶")}</span></button> `);
        if (expanded[catKey]) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="grid grid-cols-3 gap-2 bg-background/50 p-3"><!--[-->`);
          const each_array_1 = ensure_array_like(getShapes(catKey));
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let shape = each_array_1[$$index];
            $$renderer2.push(`<button class="group relative flex flex-col items-center justify-center rounded-lg border border-transparent p-1.5 transition-all hover:border-white/10 hover:bg-surface"${attr("title", shape.label)} draggable="true"><div class="flex h-8 w-8 items-center justify-center text-text-tertiary transition-colors group-hover:text-white">`);
            if (shape.type === "text") {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<span class="font-serif text-xl font-bold">T</span>`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<svg viewBox="0 0 40 40" class="h-7 w-7 fill-none stroke-current opacity-80 group-hover:opacity-100" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path${attr("d", getShapePath(shape.type, 40, 40))} vector-effect="non-scaling-stroke"></path></svg>`);
            }
            $$renderer2.push(`<!--]--></div> <span class="mt-1 w-full truncate text-center text-[9px] text-text-secondary group-hover:text-white">${escape_html(shape.label)}</span></button>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></aside>`);
  });
}
function PropertyPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let activeTab = "style";
    let selectedNodeId = store_get($$store_subs ??= {}, "$selectionStore", selectionStore).nodes[0];
    let selectedEdgeId = store_get($$store_subs ??= {}, "$selectionStore", selectionStore).edges[0];
    let selectedNode = selectedNodeId ? store_get($$store_subs ??= {}, "$documentStore", documentStore).nodes.find((n) => n.id === selectedNodeId) : null;
    let selectedEdge = selectedEdgeId ? store_get($$store_subs ??= {}, "$documentStore", documentStore).edges.find((e) => e.id === selectedEdgeId) : null;
    function updateNodeStyle(prop, value) {
      if (selectedNodeId && selectedNode) {
        const currentStyle = selectedNode.style || {};
        documentStore.updateNode(selectedNodeId, { style: { ...currentStyle, [prop]: value } });
      }
    }
    function updateEdge(prop, value) {
      if (selectedEdgeId) {
        documentStore.updateEdge(selectedEdgeId, { [prop]: value });
      }
    }
    function updateEdgeStyle(prop, value) {
      if (selectedEdgeId && selectedEdge) {
        const currentStyle = selectedEdge.style || {};
        documentStore.updateEdge(selectedEdgeId, { style: { ...currentStyle, [prop]: value } });
      }
    }
    $$renderer2.push(`<div class="flex h-full w-64 flex-col border-l border-white/5 bg-background/90 backdrop-blur-xl shadow-xl"><div class="border-b border-white/5 bg-surface/50 px-4 py-3"><h2 class="text-xs font-bold tracking-wider text-text-tertiary uppercase font-outfit">Properties</h2></div> `);
    if (selectedNode) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex border-b border-white/5"><!--[-->`);
      const each_array = ensure_array_like(["style", "text", "arrange"]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let tab = each_array[$$index];
        $$renderer2.push(`<button${attr_class(`flex-1 py-2 text-xs font-medium capitalize transition-colors ${stringify(activeTab === tab ? "border-b-2 border-primary bg-primary/10 text-primary" : "text-text-secondary hover:bg-surface/50 hover:text-white")}`)}>${escape_html(tab)}</button>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4 svelte-1nf6gyt">`);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="space-y-4"><div class="space-y-2"><p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Fill</p> <div class="flex items-center gap-2"><input type="color"${attr("value", selectedNode.style?.fill || "#ffffff")} class="h-8 w-8 cursor-pointer rounded border border-white/10 bg-surface p-0.5"/> <span class="text-xs text-text-secondary uppercase font-mono">${escape_html(selectedNode.style?.fill || "#ffffff")}</span></div> <label class="flex items-center gap-2 text-xs text-text-secondary"><input type="checkbox"${attr("checked", !!selectedNode.style?.gradient, true)} class="rounded border-white/10 bg-surface text-primary focus:ring-primary/50"/> Gradient</label></div> <hr class="border-white/5"/> <div class="space-y-2"><p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Border</p> <div class="grid grid-cols-2 gap-2"><input type="color"${attr("value", selectedNode.style?.stroke || "#000000")} class="h-8 w-full cursor-pointer rounded border border-white/10 bg-surface p-0.5"/> <input type="number" min="0" max="20"${attr("value", selectedNode.style?.strokeWidth ?? 2)} class="h-8 w-full rounded border-white/10 bg-surface/50 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 placeholder-text-tertiary px-2" placeholder="Width"/></div> `);
        $$renderer2.select(
          {
            value: selectedNode.style?.strokeDasharray || "none",
            onchange: (e) => updateNodeStyle("strokeDasharray", e.currentTarget.value),
            class: "w-full rounded border-white/10 bg-surface/50 py-1.5 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 px-2"
          },
          ($$renderer3) => {
            $$renderer3.option({ value: "none", class: "bg-surface" }, ($$renderer4) => {
              $$renderer4.push(`Solid`);
            });
            $$renderer3.option({ value: "5,5", class: "bg-surface" }, ($$renderer4) => {
              $$renderer4.push(`Dashed`);
            });
            $$renderer3.option({ value: "2,2", class: "bg-surface" }, ($$renderer4) => {
              $$renderer4.push(`Dotted`);
            });
          }
        );
        $$renderer2.push(` <div class="mt-2 flex items-center gap-2"><span class="w-12 text-[10px] uppercase font-bold text-text-tertiary">Radius</span> <input type="number" min="0" max="50"${attr("value", selectedNode.style?.borderRadius ?? 4)} class="flex-1 rounded-lg border border-white/10 bg-surface/50 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 px-2 h-8"/></div></div> <hr class="border-white/5"/> <div class="space-y-2"><p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Effects</p> <label class="flex items-center gap-2 text-xs text-text-secondary"><input type="checkbox"${attr("checked", !!selectedNode.style?.shadow, true)} class="rounded border-white/10 bg-surface text-primary focus:ring-primary/50"/> Drop Shadow</label> <div class="flex items-center gap-2"><span class="w-12 text-xs text-text-secondary">Opacity</span> <input type="range" min="0" max="1" step="0.1"${attr("value", selectedNode.style?.opacity ?? 1)} class="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-surface accent-primary"/> <span class="w-8 text-right text-xs text-text-secondary font-mono">${escape_html(Math.round((selectedNode.style?.opacity ?? 1) * 100))}%</span></div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else if (selectedEdge) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="space-y-4 p-4 text-text-primary custom-scrollbar overflow-y-auto svelte-1nf6gyt"><div class="space-y-2"><label for="edge-line-style" class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Line Style</label> `);
      $$renderer2.select(
        {
          id: "edge-line-style",
          value: selectedEdge.type || "default",
          onchange: (e) => updateEdge("type", e.currentTarget.value),
          class: "w-full rounded-lg border border-white/10 bg-surface/50 py-1.5 px-2 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "default", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`Bezier (Smooth)`);
          });
          $$renderer3.option({ value: "orthogonal", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`Orthogonal (Step)`);
          });
          $$renderer3.option({ value: "curved", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`Curved Orthogonal`);
          });
          $$renderer3.option({ value: "straight", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`Straight`);
          });
        }
      );
      $$renderer2.push(`</div> <div class="space-y-2"><p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Stroke</p> <div class="flex gap-2"><input type="color"${attr("value", selectedEdge.style?.stroke || "#6366F1")} class="h-8 w-8 cursor-pointer rounded border border-white/10 bg-surface p-0.5"/> <input type="number" min="1" max="10"${attr("value", selectedEdge.style?.strokeWidth ?? 2)} class="h-8 flex-1 rounded-lg border border-white/10 bg-surface/50 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 px-2"/></div> `);
      $$renderer2.select(
        {
          value: selectedEdge.style?.strokeDasharray || "none",
          onchange: (e) => updateEdgeStyle("strokeDasharray", e.currentTarget.value),
          class: "mt-2 w-full rounded-lg border border-white/10 bg-surface/50 py-1.5 px-2 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "none", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`Solid`);
          });
          $$renderer3.option({ value: "5,5", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`Dashed`);
          });
          $$renderer3.option({ value: "2,2", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`Dotted`);
          });
        }
      );
      $$renderer2.push(`</div> <div class="space-y-2"><p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Markers</p> <div class="grid grid-cols-2 gap-2">`);
      $$renderer2.select(
        {
          value: selectedEdge.markerStart || "none",
          onchange: (e) => updateEdge("markerStart", e.currentTarget.value),
          class: "w-full rounded-lg border border-white/10 bg-surface/50 py-1.5 px-2 text-xs text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "none", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`None`);
          });
          $$renderer3.option({ value: "arrow", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`Arrow`);
          });
          $$renderer3.option({ value: "circle", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`Circle`);
          });
        }
      );
      $$renderer2.push(` `);
      $$renderer2.select(
        {
          value: selectedEdge.markerEnd || "arrow",
          onchange: (e) => updateEdge("markerEnd", e.currentTarget.value),
          class: "w-full rounded-lg border border-white/10 bg-surface/50 py-1.5 px-2 text-xs text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "none", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`None`);
          });
          $$renderer3.option({ value: "arrow", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`Arrow`);
          });
          $$renderer3.option({ value: "circle", class: "bg-surface" }, ($$renderer4) => {
            $$renderer4.push(`Circle`);
          });
        }
      );
      $$renderer2.push(`</div></div> <div class="space-y-2"><label class="flex items-center gap-2 text-xs text-text-secondary"><input type="checkbox"${attr("checked", !!selectedEdge.animated, true)} class="rounded border-white/10 bg-surface text-primary focus:ring-primary/50"/> Animated</label></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="flex flex-1 items-center justify-center p-8 text-center text-text-tertiary"><div class="space-y-3"><div class="mx-auto w-10 h-10 rounded-xl bg-surface/50 flex items-center justify-center mb-2 border border-white/5"><svg class="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg></div> <p class="text-[13px]">Select a shape or connection to edit its properties</p></div></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function DslEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      diagramType = "flowchart",
      title = "Untitled",
      visible = false
    } = $$props;
    let dslText = "";
    let panelHeight = 250;
    if (visible) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex flex-col border-t border-white/5 bg-surface/90 backdrop-blur-xl"${attr_style(`height: ${stringify(panelHeight)}px`)}><div class="flex h-1.5 cursor-ns-resize items-center justify-center bg-background/50 hover:bg-primary/30 transition-colors"><div class="h-0.5 w-8 rounded-full bg-white/20"></div></div> <div class="flex items-center justify-between border-b border-white/5 px-4 py-2 bg-surface/50"><div class="flex items-center gap-2"><svg class="h-4 w-4 text-[#06b6d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> <span class="text-[11px] font-bold tracking-wider text-text-tertiary uppercase font-outfit">DSL Editor</span></div> <div class="flex items-center gap-2"><button class="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20">Apply</button> <button class="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-white/5 hover:text-white" aria-label="Close DSL Editor"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div> <textarea class="flex-1 resize-none bg-background p-4 font-mono text-[13px] text-text-primary placeholder-text-tertiary focus:outline-none"${attr("placeholder", `@${diagramType} "${title}"

start "Begin"
process "Step 1"
end "Finish"

start -> "Step 1"
"Step 1" -> end`)} spellcheck="false">`);
      const $$body = escape_html(dslText);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function Minimap($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const MINIMAP_WIDTH = 160;
    const MINIMAP_HEIGHT = 100;
    let bounds = (() => {
      const nodes = store_get($$store_subs ??= {}, "$documentStore", documentStore).nodes;
      if (nodes.length === 0) return { x: 0, y: 0, width: 800, height: 600 };
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const node of nodes) {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + (node.width || 120));
        maxY = Math.max(maxY, node.position.y + (node.height || 60));
      }
      const padding = 100;
      return {
        x: minX - padding,
        y: minY - padding,
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2
      };
    })();
    let scale = Math.min(MINIMAP_WIDTH / bounds.width, MINIMAP_HEIGHT / bounds.height);
    let viewport = (() => {
      const vw = (typeof window !== "undefined" ? window.innerWidth : 1200) / store_get($$store_subs ??= {}, "$canvasStore", canvasStore).k;
      const vh = (typeof window !== "undefined" ? window.innerHeight : 800) / store_get($$store_subs ??= {}, "$canvasStore", canvasStore).k;
      const vx = -store_get($$store_subs ??= {}, "$canvasStore", canvasStore).x / store_get($$store_subs ??= {}, "$canvasStore", canvasStore).k;
      const vy = -store_get($$store_subs ??= {}, "$canvasStore", canvasStore).y / store_get($$store_subs ??= {}, "$canvasStore", canvasStore).k;
      return {
        x: (vx - bounds.x) * scale,
        y: (vy - bounds.y) * scale,
        width: vw * scale,
        height: vh * scale
      };
    })();
    $$renderer2.push(`<div class="absolute right-3 bottom-3 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/80 shadow-lg backdrop-blur-sm"><svg${attr("width", MINIMAP_WIDTH)}${attr("height", MINIMAP_HEIGHT)} class="block"><rect width="100%" height="100%" fill="transparent"></rect><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$documentStore", documentStore).nodes);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let node = each_array[$$index];
      $$renderer2.push(`<rect${attr("x", (node.position.x - bounds.x) * scale)}${attr("y", (node.position.y - bounds.y) * scale)}${attr("width", (node.width || 120) * scale)}${attr("height", (node.height || 60) * scale)} rx="1" class="fill-indigo-500/60"></rect>`);
    }
    $$renderer2.push(`<!--]--><!--[-->`);
    const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$documentStore", documentStore).edges);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let edge = each_array_1[$$index_1];
      const source = store_get($$store_subs ??= {}, "$documentStore", documentStore).nodes.find((n) => n.id === edge.source);
      const target = store_get($$store_subs ??= {}, "$documentStore", documentStore).nodes.find((n) => n.id === edge.target);
      if (source && target) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<line${attr("x1", (source.position.x + (source.width || 120) / 2 - bounds.x) * scale)}${attr("y1", (source.position.y + (source.height || 60) / 2 - bounds.y) * scale)}${attr("x2", (target.position.x + (target.width || 120) / 2 - bounds.x) * scale)}${attr("y2", (target.position.y + (target.height || 60) / 2 - bounds.y) * scale)} class="stroke-slate-500/40" stroke-width="0.5"></line>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--><rect${attr("x", viewport.x)}${attr("y", viewport.y)}${attr("width", viewport.width)}${attr("height", viewport.height)} rx="1" class="fill-white/5 stroke-cyan-400/60" stroke-width="1"></rect></svg></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let diagramTitle = "Untitled Diagram";
    let diagramType = "flowchart";
    let showDslEditor = false;
    let svgRef = void 0;
    let isDirty = false;
    let isSaving = false;
    let lastSavedAt = null;
    onDestroy(() => {
    });
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex h-screen w-screen flex-col overflow-hidden bg-background text-text-primary font-inter">`);
      Toolbar($$renderer3, {
        title: diagramTitle,
        diagramType,
        isDirty,
        isSaving,
        lastSavedAt
      });
      $$renderer3.push(`<!----> <div class="relative flex flex-1 overflow-hidden">`);
      {
        $$renderer3.push("<!--[-->");
        Sidebar($$renderer3);
      }
      $$renderer3.push(`<!--]--> <main class="relative flex flex-1 flex-col bg-[#0f141f]"><div class="relative flex-1">`);
      Canvas($$renderer3, {
        get svgElement() {
          return svgRef;
        },
        set svgElement($$value) {
          svgRef = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          EdgeRenderer($$renderer4);
          $$renderer4.push(`<!----> `);
          NodeRenderer($$renderer4);
          $$renderer4.push(`<!----> `);
          EdgeHandleRenderer($$renderer4);
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      FloatingToolbar($$renderer3);
      $$renderer3.push(`<!----> `);
      Minimap($$renderer3);
      $$renderer3.push(`<!----> `);
      {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="absolute right-0 bottom-0 left-0 z-20"><button class="flex w-full items-center justify-between border-t border-white/5 bg-surface/90 px-4 py-2 backdrop-blur-md transition-colors hover:bg-surface" aria-label="Open DSL Editor"><div class="flex items-center gap-2"><svg class="h-4 w-4 text-[#06b6d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> <span class="text-xs font-medium text-text-secondary">Text-to-Diagram (DSL)</span></div> <svg class="h-4 w-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg></button></div>`);
      }
      $$renderer3.push(`<!--]--></div> `);
      DslEditor($$renderer3, {
        diagramType,
        title: diagramTitle,
        visible: showDslEditor
      });
      $$renderer3.push(`<!----></main> `);
      {
        $$renderer3.push("<!--[-->");
        PropertyPanel($$renderer3);
      }
      $$renderer3.push(`<!--]--></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
