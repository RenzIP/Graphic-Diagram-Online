function parseDSL(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//"));
  const ast = {
    diagramType: "flowchart",
    title: "Untitled",
    nodes: [],
    edges: []
  };
  let currentBlockNode = null;
  for (const line of lines) {
    if (currentBlockNode && line === "}") {
      ast.nodes.push(currentBlockNode);
      currentBlockNode = null;
      continue;
    }
    if (currentBlockNode) {
      if (!currentBlockNode.attributes) currentBlockNode.attributes = [];
      currentBlockNode.attributes.push(line);
      continue;
    }
    const metaMatch = line.match(/^@(\w+)\s+"?([^"]+)"?$/);
    if (metaMatch) {
      ast.diagramType = metaMatch[1];
      ast.title = metaMatch[2];
      continue;
    }
    const edgeLabelMatch = line.match(/^"?([^"]+)"?\s+--([^-]+)-->\s+"?([^"]+)"?$/);
    if (edgeLabelMatch) {
      ast.edges.push({
        type: "edge",
        source: edgeLabelMatch[1],
        target: edgeLabelMatch[3],
        edgeLabel: edgeLabelMatch[2]
      });
      continue;
    }
    const edgeColonMatch = line.match(/^"?([^"]+)"?\s+->\s+"?([^"]+)"?\s*:\s*(.+)$/);
    if (edgeColonMatch) {
      ast.edges.push({
        type: "edge",
        source: edgeColonMatch[1],
        target: edgeColonMatch[2],
        edgeLabel: edgeColonMatch[3]
      });
      continue;
    }
    const edgeMatch = line.match(/^"?([^"]+)"?\s+->\s+"?([^"]+)"?$/);
    if (edgeMatch) {
      ast.edges.push({
        type: "edge",
        source: edgeMatch[1],
        target: edgeMatch[2]
      });
      continue;
    }
    const blockStartMatch = line.match(/^(\w+)\s+"?([^"]+)"?\s*\{$/);
    if (blockStartMatch) {
      currentBlockNode = {
        type: "node",
        nodeType: blockStartMatch[1],
        label: blockStartMatch[2],
        attributes: []
      };
      continue;
    }
    const componentMatch = line.match(/^(\w+)\s+"([^"]+)"$/);
    if (componentMatch) {
      ast.nodes.push({
        type: "node",
        nodeType: componentMatch[1],
        label: componentMatch[2]
      });
      continue;
    }
    const simpleNodeMatch = line.match(/^(\w+)\s+([^\s{}"\->]+)$/);
    if (simpleNodeMatch) {
      ast.nodes.push({
        type: "node",
        nodeType: simpleNodeMatch[1],
        label: simpleNodeMatch[2]
      });
      continue;
    }
  }
  return ast;
}
export {
  parseDSL
};
