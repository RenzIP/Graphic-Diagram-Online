/**
 * SVG Paths/Polygons for generic shapes
 * Scaled or calculated based on width (w) and height (h)
 */

export const getShapePath = (type: string, w: number, h: number): string => {
    switch (type) {
        // --- Basic Shapes ---
        case 'note':
            // Folded corner
            const fold = Math.min(w, h) * 0.25;
            return `M0,0 L${w - fold},0 L${w},${fold} L${w},${h} L0,${h} Z M${w - fold},0 L${w - fold},${fold} L${w},${fold}`;

        case 'cloud':
            // Simplified cloud path (3 bumps top, 1 bump sides) - Approximate
            return `M${w * 0.25},${h * 0.75} 
                    Q${w * 0.1},${h * 0.75} ${w * 0.1},${h * 0.5} 
                    Q${w * 0.1},${h * 0.1} ${w * 0.4},${h * 0.1} 
                    Q${w * 0.5},${h * 0} ${w * 0.7},${h * 0.1} 
                    Q${w * 0.95},${h * 0.1} ${w * 0.95},${h * 0.5} 
                    Q${w * 1.05},${h * 0.7} ${w * 0.9},${h * 0.9} 
                    Q${w * 0.6},${h} ${w * 0.25},${h * 0.9} Z`;

        case 'star':
            // 5-point star
            const cx = w / 2;
            const cy = h / 2;
            const outerRadius = Math.min(w, h) / 2;
            const innerRadius = outerRadius / 2.5;
            let path = "";
            for (let i = 0; i < 10; i++) {
                const r = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (Math.PI / 5) * i - Math.PI / 2;
                path += (i === 0 ? "M" : "L") + (cx + Math.cos(angle) * r) + "," + (cy + Math.sin(angle) * r);
            }
            return path + " Z";

        case 'hexagon':
            return `M${w * 0.25},0 L${w * 0.75},0 L${w},${h / 2} L${w * 0.75},${h} L${w * 0.25},${h} L0,${h / 2} Z`;

        case 'octagon':
            const o = Math.min(w, h) * 0.3;
            return `M${o},0 L${w - o},0 L${w},${o} L${w},${h - o} L${w - o},${h} L${o},${h} L0,${h - o} L0,${o} Z`;

        case 'pentagon':
            return `M${w / 2},0 L${w},${h * 0.38} L${w * 0.82},${h} L${w * 0.18},${h} L0,${h * 0.38} Z`;

        case 'cross':
            const th = Math.min(w, h) * 0.25; // thickness
            const mx = w / 2, my = h / 2;
            return `M${mx - th},0 L${mx + th},0 L${mx + th},${my - th} L${w},${my - th} L${w},${my + th} L${mx + th},${my + th} L${mx + th},${h} L${mx - th},${h} L${mx - th},${my + th} L0,${my + th} L0,${my - th} L${mx - th},${my - th} Z`;

        case 'trapezoid':
            return `M${w * 0.2},0 L${w * 0.8},0 L${w},${h} L0,${h} Z`;

        // --- Flowchart Symbols ---
        case 'manual-input': // Trapezoid with higher top side
            return `M0,${h * 0.2} L${w},0 L${w},${h} L0,${h} Z`;

        case 'manual-operation': // Trapezoid
            return `M0,0 L${w},0 L${w * 0.8},${h} L${w * 0.2},${h} Z`;

        case 'delay': // D shape
            return `M0,0 L${w * 0.7},0 Q${w},0 ${w},${h / 2} Q${w},${h} ${w * 0.7},${h} L0,${h} Z`;

        case 'display': // Bullet shape
            return `M0,${h / 2} L${w * 0.2},0 L${w * 0.8},0 Q${w},${h / 2} ${w * 0.8},${h} L${w * 0.2},${h} Z`; // Wait, standard display is different
            // Correct Display: Pointed left, rounded right? No, usually D-like but specific.
            // Standard: Rectangle with curved right side.
            return `M0,0 L${w * 0.8},0 Q${w},${h / 2} ${w * 0.8},${h} L0,${h} Z`;

        case 'internal-storage': // Box with lines
            // This needs multiple lines, but path only handles outline.
            // We can return main outline and handle lines in component, OR generic render returns multiple paths?
            // For simplicity, just the outline (Rectangle) 
            // We might need a specific component for internal-storage if lines are critical.
            // Let's do a "custom" path that traces the lines? 
            // M0,h40 L0,0 Lw,0 Lw,h L0,h L0,h40 M40,0 L40,h ?
            return `M0,0 L${w},0 L${w},${h} L0,${h} Z M15,0 L15,${h} M0,15 L${w},15`;
        // Basic SVG path can contain moves.

        case 'document':
            // Wavy bottom
            return `M0,0 L${w},0 L${w},${h * 0.8} Q${w * 0.75},${h} ${w * 0.5},${h * 0.8} Q${w * 0.25},${h * 0.6} 0,${h * 0.9} Z`;

        case 'card': // Rect with cut corner
            return `M0,15 L15,0 L${w},0 L${w},${h} L0,${h} Z`;

        case 'collate': // Hourglass-ish made of triangles
            return `M0,0 L${w},0 L0,${h} L${w},${h} Z`;

        // --- Arrows ---
        case 'arrow-left':
            return `M${w},${h * 0.3} L${w * 0.4},${h * 0.3} L${w * 0.4},0 L0,${h * 0.5} L${w * 0.4},${h} L${w * 0.4},${h * 0.7} L${w},${h * 0.7} Z`;
        case 'arrow-right':
            return `M0,${h * 0.3} L${w * 0.6},${h * 0.3} L${w * 0.6},0 L${w},${h * 0.5} L${w * 0.6},${h} L${w * 0.6},${h * 0.7} L0,${h * 0.7} Z`;

        // Default
        default:
            return `M0,0 L${w},0 L${w},${h} L0,${h} Z`; // Rect
    }
};
