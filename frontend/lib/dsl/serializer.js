const TYPE_TO_DSL = {
  "start-end": "start",
  process: "process",
  decision: "decision",
  entity: "entity",
  actor: "actor",
  "input-output": "io",
  database: "db",
  text: "text",
  lifeline: "lifeline",
  usecase: "usecase",
  relationship: "rel",
  attribute: "attr"
};
function serializeToText(state, diagramType = "flowchart", title = "Untitled") {
  const lines = [];
  lines.push(`@${diagramType} "${title}"`);
  lines.push("");
  const idToLabel = {};
  state.nodes.forEach((n) => {
    idToLabel[n.id] = n.label ?? n.id;
  });
  const isEndNode = (n) => n.type === "start-end" && (n.label ?? "").toLowerCase().includes("end");
  state.nodes.forEach((node) => {
    const dslType = isEndNode(node) ? "end" : TYPE_TO_DSL[node.type] || "process";
    if (node.data?.attributes && node.data.attributes.length > 0) {
      lines.push(`${dslType} "${node.label}" {`);
      node.data.attributes.forEach((attr) => {
        lines.push(`  ${attr}`);
      });
      lines.push(`}`);
    } else {
      lines.push(`${dslType} "${node.label}"`);
    }
  });
  if (state.edges.length > 0) {
    lines.push("");
  }
  state.edges.forEach((edge) => {
    const sourceLabel = idToLabel[edge.source] || edge.source;
    const targetLabel = idToLabel[edge.target] || edge.target;
    if (edge.label) {
      lines.push(`"${sourceLabel}" -> "${targetLabel}" : ${edge.label}`);
    } else {
      lines.push(`"${sourceLabel}" -> "${targetLabel}"`);
    }
  });
  return lines.join("\n");
}
export {
  serializeToText
};
