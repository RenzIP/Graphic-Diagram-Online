const DEFAULT_GRID_SIZE = 20;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const DEFAULT_ZOOM = 1;
const DEFAULT_NODE_WIDTH = 120;
const DEFAULT_NODE_HEIGHT = 60;
const MIN_NODE_WIDTH = 50;
const MIN_NODE_HEIGHT = 30;
const MAX_HISTORY_SIZE = 50;
const NODE_COLORS = [
  { name: "Indigo", value: "indigo" },
  { name: "Purple", value: "purple" },
  { name: "Cyan", value: "cyan" },
  { name: "Emerald", value: "emerald" },
  { name: "Amber", value: "amber" },
  { name: "Red", value: "red" },
  { name: "Pink", value: "pink" },
  { name: "Slate", value: "slate" }
];
const DIAGRAM_TYPES = [
  { id: "flowchart", name: "Flowchart", icon: "\u2B21" },
  { id: "erd", name: "ER Diagram", icon: "\u229E" },
  { id: "usecase", name: "Use Case", icon: "\u25CE" },
  { id: "sequence", name: "Sequence", icon: "\u21C5" },
  { id: "mindmap", name: "Mind Map", icon: "\u2726" },
  { id: "blank", name: "Blank Diagram", icon: "\u2B1C" }
];
const EDGE_TYPES = [
  { id: "default", name: "Bezier" },
  { id: "straight", name: "Straight" },
  { id: "step", name: "Step" }
];
const NODE_SHAPES = {
  general: [
    { type: "process", label: "Rectangle", icon: "\u25AD" },
    { type: "rounded", label: "Rounded", icon: "\u25A2" },
    { type: "ellipse", label: "Ellipse", icon: "\u25CB" },
    { type: "triangle", label: "Triangle", icon: "\u25B3" },
    { type: "diamond", label: "Diamond", icon: "\u25C7" },
    { type: "parallelogram", label: "Parallelogram", icon: "\u25B1" },
    { type: "hexagon", label: "Hexagon", icon: "\u2394" },
    { type: "octagon", label: "Octagon", icon: "\u{1F6D1}" },
    { type: "trapezoid", label: "Trapezoid", icon: "\u23E2" },
    { type: "star", label: "Star", icon: "\u2605" },
    { type: "cloud", label: "Cloud", icon: "\u2601" },
    { type: "note", label: "Note", icon: "\u{1F4DD}" },
    { type: "callout", label: "Callout", icon: "\u{1F4AC}" },
    { type: "cylinder", label: "Cylinder", icon: "\u26C1" },
    { type: "cube", label: "Cube", icon: "\u{1F4E6}" },
    { type: "cross", label: "Cross", icon: "\u271A" },
    { type: "text", label: "Text", icon: "T" }
  ],
  flowchart: [
    { type: "start-end", label: "Start / End", icon: "\u2B2D" },
    { type: "process", label: "Process", icon: "\u25AD" },
    { type: "decision", label: "Decision", icon: "\u25C7" },
    { type: "terminator", label: "Terminator", icon: "\u2B2C" },
    { type: "input-output", label: "Input / Output", icon: "\u25B1" },
    { type: "manual-input", label: "Manual Input", icon: "\u2328" },
    { type: "manual-operation", label: "Manual Op", icon: "\u2699" },
    { type: "preparation", label: "Preparation", icon: "\u2B21" },
    { type: "delay", label: "Delay", icon: "D" },
    { type: "display", label: "Display", icon: "\u{1F5A5}" },
    { type: "document", label: "Document", icon: "\u{1F4C4}" },
    { type: "multi-document", label: "Multi-Document", icon: "\u{1F4DA}" },
    { type: "database", label: "Database", icon: "\u26C1" },
    { type: "internal-storage", label: "Internal Storage", icon: "\u25A6" },
    { type: "collate", label: "Collate", icon: "\u29D6" },
    { type: "off-page", label: "Off-Page Connector", icon: "\u2B07" }
  ],
  uml: [
    { type: "actor", label: "Actor", icon: "\uC6C3" },
    { type: "usecase", label: "Use Case", icon: "\u2B2D" },
    { type: "class", label: "Class", icon: "\u25AD" },
    { type: "interface", label: "Interface", icon: "\u25CB" },
    { type: "package", label: "Package", icon: "\u{1F4C1}" },
    { type: "note", label: "Note", icon: "\u{1F4DD}" },
    { type: "process", label: "Object", icon: "\u25AD" }
  ],
  erd: [
    { type: "entity", label: "Entity", icon: "\u25AD" },
    { type: "weak-entity", label: "Weak Entity", icon: "\u25F3" },
    { type: "attribute", label: "Attribute", icon: "\u25CB" },
    { type: "relationship", label: "Relationship", icon: "\u25C7" }
  ],
  bpmn: [
    { type: "start-event", label: "Start Event", icon: "\u25CB" },
    { type: "intermediate-event", label: "Intermediate", icon: "\u25CE" },
    { type: "end-event", label: "End Event", icon: "\u25C9" },
    { type: "gateway", label: "Gateway", icon: "\u25C7" },
    { type: "process", label: "Task", icon: "\u25AD" }
  ],
  network: [
    { type: "server", label: "Server", icon: "\u{1F5A5}" },
    { type: "database", label: "DB Server", icon: "\u26C1" },
    { type: "cloud", label: "Cloud", icon: "\u2601" }
  ],
  arrows: [
    { type: "arrow-left", label: "Left Arrow", icon: "\u2190" },
    { type: "arrow-right", label: "Right Arrow", icon: "\u2192" }
  ]
};
const allShapesMap = /* @__PURE__ */ new Map();
Object.values(NODE_SHAPES).flat().forEach((s) => allShapesMap.set(s.type, s));
const ALL_SHAPES = Array.from(allShapesMap.values());
NODE_SHAPES["blank"] = ALL_SHAPES;
NODE_SHAPES["all"] = ALL_SHAPES;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
export {
  ALL_SHAPES,
  API_BASE_URL,
  DEFAULT_GRID_SIZE,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  DEFAULT_ZOOM,
  DIAGRAM_TYPES,
  EDGE_TYPES,
  MAX_HISTORY_SIZE,
  MAX_ZOOM,
  MIN_NODE_HEIGHT,
  MIN_NODE_WIDTH,
  MIN_ZOOM,
  NODE_COLORS,
  NODE_SHAPES,
  WS_BASE_URL
};
