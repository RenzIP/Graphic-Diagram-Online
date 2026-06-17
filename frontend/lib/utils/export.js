async function exportPNG(svgElement, state, filename = "diagram.png") {
  const { svg: preparedSvg, width, height } = prepareSvgForExport(svgElement, state);
  await exportRaster(preparedSvg, width, height, filename, "image/png");
}
async function exportJPG(svgElement, state, filename = "diagram.jpg") {
  const { svg: preparedSvg, width, height } = prepareSvgForExport(svgElement, state);
  await exportRaster(preparedSvg, width, height, filename, "image/jpeg", "#0f172a");
}
async function exportWebP(svgElement, state, filename = "diagram.webp") {
  const { svg: preparedSvg, width, height } = prepareSvgForExport(svgElement, state);
  await exportRaster(preparedSvg, width, height, filename, "image/webp");
}
function exportSVG(svgElement, state, filename = "diagram.svg") {
  const { svg: preparedSvg } = prepareSvgForExport(svgElement, state);
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(preparedSvg);
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
}
function prepareSvgForExport(originalSvg, state) {
  const clone = originalSvg.cloneNode(true);
  const gridRect = clone.querySelector('rect[fill*="#grid-pattern"]');
  if (gridRect) gridRect.remove();
  const uiSelectors = [
    'rect[class*="fill-indigo-500/10"]',
    'path[stroke-dasharray="5,5"]',
    "rect.dashed"
  ];
  uiSelectors.forEach((selector) => {
    clone.querySelectorAll(selector).forEach((el) => el.remove());
  });
  const contentGroup = clone.querySelector("g[transform]");
  if (contentGroup) {
    contentGroup.setAttribute("transform", "");
  }
  let x = 0, y = 0, w = originalSvg.clientWidth, h = originalSvg.clientHeight;
  if (state && state.nodes.length > 0) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const padding = 40;
    state.nodes.forEach((node) => {
      const nx = node.position.x;
      const ny = node.position.y;
      const nw = node.width || 120;
      const nh = node.height || 60;
      minX = Math.min(minX, nx);
      minY = Math.min(minY, ny);
      maxX = Math.max(maxX, nx + nw);
      maxY = Math.max(maxY, ny + nh);
    });
    if (minX !== Infinity) {
      x = minX - padding;
      y = minY - padding;
      w = maxX - minX + padding * 2;
      h = maxY - minY + padding * 2;
    }
  }
  clone.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
  clone.setAttribute("width", `${w}`);
  clone.setAttribute("height", `${h}`);
  return { svg: clone, width: w, height: h };
}
async function exportRaster(svgElement, width, height, filename, mimeType, bgColor) {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
  const img = new Image();
  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) downloadBlob(blob, filename);
          URL.revokeObjectURL(svgUrl);
          resolve();
        },
        mimeType,
        0.95
      );
    };
    img.onerror = (e) => {
      console.error("Export failed", e);
      resolve();
    };
    img.src = svgUrl;
  });
}
function exportJSON(state, filename = "diagram.json") {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, filename);
}
function exportDSL(dslText, filename = "diagram.dsl") {
  const blob = new Blob([dslText], { type: "text/plain" });
  downloadBlob(blob, filename);
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
export {
  exportDSL,
  exportJPG,
  exportJSON,
  exportPNG,
  exportSVG,
  exportWebP
};
