/**
 * GraDiOl — Export engine
 * Supports: PNG, SVG, JSON
 * Matching Konsep Aplikasi §6.3
 */
import type { DocumentState } from '$lib/stores/document';

/** Export SVG canvas as PNG image */
export async function exportPNG(svgElement: SVGSVGElement, filename = 'diagram.png'): Promise<void> {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2; // Retina
        canvas.width = svgElement.clientWidth * scale;
        canvas.height = svgElement.clientHeight * scale;

        const ctx = canvas.getContext('2d')!;
        ctx.scale(scale, scale);
        ctx.fillStyle = '#0f172a'; // slate-900 bg
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) downloadBlob(blob, filename);
            URL.revokeObjectURL(url);
        }, 'image/png');
    };
    img.src = url;
}

/** Export SVG canvas as SVG file */
export function exportSVG(svgElement: SVGSVGElement, filename = 'diagram.svg'): void {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, filename);
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
