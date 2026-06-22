import { a as attr, c as bind_props } from "./index2.js";
import { e as escape_html } from "./context.js";
function Modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = false, title = "", onclose, children } = $$props;
    if (open) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div class="animate-in w-full max-w-lg rounded-2xl border border-navy-800 bg-navy-950/95 backdrop-blur-xl shadow-2xl shadow-black/60 svelte-32v57s" role="dialog" aria-modal="true"${attr("aria-label", title || "Modal dialog")}>`);
      if (title) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="flex items-center justify-between border-b border-navy-800 px-6 py-4"><h2 class="text-lg font-semibold text-white tracking-tight">${escape_html(title)}</h2> <button class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-navy-800 hover:text-white" aria-label="Close"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="p-6">`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { open });
  });
}
const MAX_HISTORY_SIZE = 50;
const DIAGRAM_TYPES = [
  { id: "flowchart", name: "Flowchart", icon: "⬡" },
  { id: "erd", name: "ER Diagram", icon: "⊞" },
  { id: "usecase", name: "Use Case", icon: "◎" },
  { id: "sequence", name: "Sequence", icon: "⇅" },
  { id: "mindmap", name: "Mind Map", icon: "✦" },
  { id: "blank", name: "Blank Diagram", icon: "⬜" }
];
const NODE_SHAPES = {
  general: [
    { type: "process", label: "Rectangle", icon: "▭" },
    { type: "rounded", label: "Rounded", icon: "▢" },
    { type: "ellipse", label: "Ellipse", icon: "○" },
    { type: "triangle", label: "Triangle", icon: "△" },
    { type: "diamond", label: "Diamond", icon: "◇" },
    { type: "parallelogram", label: "Parallelogram", icon: "▱" },
    { type: "hexagon", label: "Hexagon", icon: "⎔" },
    { type: "octagon", label: "Octagon", icon: "🛑" },
    { type: "trapezoid", label: "Trapezoid", icon: "⏢" },
    { type: "star", label: "Star", icon: "★" },
    { type: "cloud", label: "Cloud", icon: "☁" },
    { type: "note", label: "Note", icon: "📝" },
    { type: "callout", label: "Callout", icon: "💬" },
    { type: "cylinder", label: "Cylinder", icon: "⛁" },
    { type: "cube", label: "Cube", icon: "📦" },
    { type: "cross", label: "Cross", icon: "✚" },
    { type: "text", label: "Text", icon: "T" }
  ],
  flowchart: [
    { type: "start-end", label: "Start / End", icon: "⬭" },
    { type: "process", label: "Process", icon: "▭" },
    { type: "decision", label: "Decision", icon: "◇" },
    { type: "terminator", label: "Terminator", icon: "⬬" },
    { type: "input-output", label: "Input / Output", icon: "▱" },
    { type: "manual-input", label: "Manual Input", icon: "⌨" },
    { type: "manual-operation", label: "Manual Op", icon: "⚙" },
    { type: "preparation", label: "Preparation", icon: "⬡" },
    { type: "delay", label: "Delay", icon: "D" },
    { type: "display", label: "Display", icon: "🖥" },
    { type: "document", label: "Document", icon: "📄" },
    { type: "multi-document", label: "Multi-Document", icon: "📚" },
    { type: "database", label: "Database", icon: "⛁" },
    { type: "internal-storage", label: "Internal Storage", icon: "▦" },
    { type: "collate", label: "Collate", icon: "⧖" },
    { type: "off-page", label: "Off-Page Connector", icon: "⬇" }
  ],
  uml: [
    { type: "actor", label: "Actor", icon: "웃" },
    { type: "usecase", label: "Use Case", icon: "⬭" },
    { type: "class", label: "Class", icon: "▭" },
    { type: "interface", label: "Interface", icon: "○" },
    { type: "package", label: "Package", icon: "📁" },
    { type: "note", label: "Note", icon: "📝" },
    { type: "process", label: "Object", icon: "▭" }
  ],
  erd: [
    { type: "entity", label: "Entity", icon: "▭" },
    { type: "weak-entity", label: "Weak Entity", icon: "◳" },
    { type: "attribute", label: "Attribute", icon: "○" },
    { type: "relationship", label: "Relationship", icon: "◇" }
  ],
  bpmn: [
    { type: "start-event", label: "Start Event", icon: "○" },
    { type: "intermediate-event", label: "Intermediate", icon: "◎" },
    { type: "end-event", label: "End Event", icon: "◉" },
    { type: "gateway", label: "Gateway", icon: "◇" },
    { type: "process", label: "Task", icon: "▭" }
  ],
  network: [
    { type: "server", label: "Server", icon: "🖥" },
    { type: "database", label: "DB Server", icon: "⛁" },
    { type: "cloud", label: "Cloud", icon: "☁" }
  ],
  arrows: [
    { type: "arrow-left", label: "Left Arrow", icon: "←" },
    { type: "arrow-right", label: "Right Arrow", icon: "→" }
  ]
};
const allShapesMap = /* @__PURE__ */ new Map();
Object.values(NODE_SHAPES).flat().forEach((s) => allShapesMap.set(s.type, s));
const ALL_SHAPES = Array.from(allShapesMap.values());
NODE_SHAPES["blank"] = ALL_SHAPES;
NODE_SHAPES["all"] = ALL_SHAPES;
export {
  DIAGRAM_TYPES as D,
  Modal as M,
  NODE_SHAPES as N,
  MAX_HISTORY_SIZE as a
};
