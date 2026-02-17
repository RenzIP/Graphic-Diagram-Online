/**
 * GraDiOl — Export engine
 * Supports: PNG, SVG, JSON, DSL, WebP, JPG
 * Matching Konsep Aplikasi §6.3
 */
import type { DocumentState } from '$lib/stores/document';

/** Export SVG canvas as PNG image */
export async function exportPNG(svgElement: SVGSVGElement, state?: DocumentState, filename = 'diagram.png'): Promise<void> {
    const { svg: preparedSvg, width, height } = prepareSvgForExport(svgElement, state);
    await exportRaster(preparedSvg, width, height, filename, 'image/png');
}

/** Export SVG canvas as JPG image */
export async function exportJPG(svgElement: SVGSVGElement, state?: DocumentState, filename = 'diagram.jpg'): Promise<void> {
    const { svg: preparedSvg, width, height } = prepareSvgForExport(svgElement, state);
    await exportRaster(preparedSvg, width, height, filename, 'image/jpeg', '#0f172a'); // Keep dark bg for visibility
}

/** Export SVG canvas as WebP image */
export async function exportWebP(svgElement: SVGSVGElement, state?: DocumentState, filename = 'diagram.webp'): Promise<void> {
    const { svg: preparedSvg, width, height } = prepareSvgForExport(svgElement, state);
    await exportRaster(preparedSvg, width, height, filename, 'image/webp');
}

/** Export SVG canvas as SVG file */
export function exportSVG(svgElement: SVGSVGElement, state?: DocumentState, filename = 'diagram.svg'): void {
    const { svg: preparedSvg } = prepareSvgForExport(svgElement, state);
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(preparedSvg);

    // Ensure namespace
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, filename);
}

/** Prepare SVG for export: Clone, Crop, Clean */
function prepareSvgForExport(originalSvg: SVGSVGElement, state?: DocumentState): { svg: SVGSVGElement, width: number, height: number } {
    const clone = originalSvg.cloneNode(true) as SVGSVGElement;

    // 1. Remove Grid (rect with url(#grid-pattern))
    const gridRect = clone.querySelector('rect[fill*="#grid-pattern"]');
    if (gridRect) gridRect.remove();

    // 2. Remove UI Helpers (Selection Box, Connection Lines, Snap Indicators)
    // Selection Box: fill-indigo-500/10
    // Connection Line: stroke-dasharray="5,5"
    // Snap Indicator: dashed
    const uiSelectors = [
        'rect[class*="fill-indigo-500/10"]',
        'path[stroke-dasharray="5,5"]',
        'rect.dashed'
    ];
    uiSelectors.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 3. Reset Transform on Content Group
    // The content is usually in the first <g> that has a transform, or checking structure
    const contentGroup = clone.querySelector('g[transform]');
    if (contentGroup) {
        contentGroup.setAttribute('transform', ''); // Reset to identity
    }

    // 4. Calculate BBox and Set ViewBox
    let x = 0, y = 0, w = originalSvg.clientWidth, h = originalSvg.clientHeight;

    if (state && state.nodes.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const padding = 40; // comfortable padding

        state.nodes.forEach(node => {
            const nx = node.position.x;
            const ny = node.position.y;
            const nw = node.width || 120;
            const nh = node.height || 60;
            minX = Math.min(minX, nx);
            minY = Math.min(minY, ny);
            maxX = Math.max(maxX, nx + nw);
            maxY = Math.max(maxY, ny + nh);
        });

        // Ensure valid BBox
        if (minX !== Infinity) {
            x = minX - padding;
            y = minY - padding;
            w = maxX - minX + (padding * 2);
            h = maxY - minY + (padding * 2);
        }
    }

    clone.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    clone.setAttribute('width', `${w}`);
    clone.setAttribute('height', `${h}`);

    return { svg: clone, width: w, height: h };
}

/** Core raster export logic */
async function exportRaster(svgElement: SVGSVGElement, width: number, height: number, filename: string, mimeType: string, bgColor?: string): Promise<void> {
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    const img = new Image();

    return new Promise((resolve) => {
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = 2; // Retina resolution
            canvas.width = width * scale;
            canvas.height = height * scale;

            const ctx = canvas.getContext('2d')!;
            ctx.scale(scale, scale);

            // Background color
            if (bgColor) {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, width, height);
            }
            // Else transparent

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) downloadBlob(blob, filename);
                URL.revokeObjectURL(svgUrl);
                resolve();
            }, mimeType, 0.95);
        };
        img.onerror = (e) => {
            console.error('Export failed', e);
            resolve();
        };
        img.src = svgUrl;
    });
}

/** Export document state as JSON */
export function exportJSON(state: DocumentState, filename = 'diagram.json'): void {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, filename);
}

/** Export document as DSL text */
export function exportDSL(dslText: string, filename = 'diagram.dsl'): void {
    const blob = new Blob([dslText], { type: 'text/plain' });
    downloadBlob(blob, filename);
}

/** Helper: download a blob as a file */
function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
