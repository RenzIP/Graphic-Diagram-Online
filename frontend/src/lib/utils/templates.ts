import type { DocumentState } from '../stores/document';

export const DIAGRAM_TEMPLATES: Record<string, DocumentState> = {
    flowchart: {
        nodes: [
            { id: '1', type: 'start-end', position: { x: 400, y: 50 }, label: 'Start Request', width: 140, height: 60, color: 'indigo' },
            { id: '2', type: 'process', position: { x: 400, y: 150 }, label: 'Validate Input', width: 160, height: 70 },
            { id: '3', type: 'decision', position: { x: 400, y: 280 }, label: 'Is Valid?', width: 140, height: 80, color: 'amber' },
            { id: '4', type: 'process', position: { x: 600, y: 280 }, label: 'Log Error', width: 140, height: 60, color: 'red' },
            { id: '5', type: 'process', position: { x: 400, y: 420 }, label: 'Process Data', width: 160, height: 70, color: 'cyan' },
            { id: '6', type: 'process', position: { x: 400, y: 530 }, label: 'Save to DB', width: 160, height: 70, color: 'emerald' },
            { id: '7', type: 'start-end', position: { x: 400, y: 650 }, label: 'Finish', width: 140, height: 60, color: 'indigo' }
        ],
        edges: [
            { id: 'e1', source: '1', target: '2', type: 'straight' },
            { id: 'e2', source: '2', target: '3', type: 'straight' },
            { id: 'e3', source: '3', target: '4', label: 'No', type: 'step' },
            { id: 'e4', source: '3', target: '5', label: 'Yes', type: 'straight' },
            { id: 'e5', source: '5', target: '6', type: 'straight' },
            { id: 'e6', source: '6', target: '7', type: 'straight' }
        ]
    },
    erd: {
        nodes: [
            // Customer Entity
            { id: 'c1', type: 'entity', position: { x: 150, y: 200 }, label: 'Customer', width: 140, height: 70, color: 'indigo' },
            { id: 'c_attr1', type: 'attribute', position: { x: 80, y: 100 }, label: 'ID (PK)', width: 100, height: 50, color: 'slate' },
            { id: 'c_attr2', type: 'attribute', position: { x: 220, y: 100 }, label: 'Name', width: 100, height: 50, color: 'slate' },

            // Relationship
            { id: 'r1', type: 'relationship', position: { x: 400, y: 200 }, label: 'Places', width: 120, height: 80, color: 'emerald' },

            // Order Entity
            { id: 'o1', type: 'entity', position: { x: 650, y: 200 }, label: 'Order', width: 140, height: 70, color: 'indigo' },
            { id: 'o_attr1', type: 'attribute', position: { x: 580, y: 320 }, label: 'OrderID (PK)', width: 110, height: 50, color: 'slate' },
            { id: 'o_attr2', type: 'attribute', position: { x: 720, y: 320 }, label: 'Date', width: 100, height: 50, color: 'slate' },
            { id: 'o_attr3', type: 'attribute', position: { x: 840, y: 200 }, label: 'Total', width: 100, height: 50, color: 'slate' }
        ],
        edges: [
            { id: 'e1', source: 'c_attr1', target: 'c1', type: 'straight' },
            { id: 'e2', source: 'c_attr2', target: 'c1', type: 'straight' },
            { id: 'e3', source: 'c1', target: 'r1', type: 'straight', label: '1' },
            { id: 'e4', source: 'r1', target: 'o1', type: 'straight', label: 'N' },
            { id: 'e5', source: 'o_attr1', target: 'o1', type: 'straight' },
            { id: 'e6', source: 'o_attr2', target: 'o1', type: 'straight' },
            { id: 'e7', source: 'o_attr3', target: 'o1', type: 'straight' }
        ]
    },
    usecase: {
        nodes: [
            // Boundary (represented by large process node or just implicit, using text node for label)
            // { id: 'sys', type: 'process', position: { x: 300, y: 50 }, width: 500, height: 600, label: '', style: 'z-index: -1' }, // No z-index support yet in templates efficiently
            // Actors
            { id: 'a1', type: 'actor', position: { x: 100, y: 200 }, label: 'Customer', color: 'indigo' },
            { id: 'a2', type: 'actor', position: { x: 100, y: 400 }, label: 'Admin', color: 'red' },

            // Use Cases
            { id: 'uc1', type: 'usecase', position: { x: 400, y: 150 }, label: 'Login', width: 160, height: 80, color: 'cyan' },
            { id: 'uc2', type: 'usecase', position: { x: 400, y: 250 }, label: 'Browse Products', width: 180, height: 80, color: 'cyan' },
            { id: 'uc3', type: 'usecase', position: { x: 400, y: 350 }, label: 'Place Order', width: 160, height: 80, color: 'cyan' },
            { id: 'uc4', type: 'usecase', position: { x: 400, y: 450 }, label: 'Manage Users', width: 160, height: 80, color: 'pink' },

            // System Label
            { id: 'lbl', type: 'text', position: { x: 400, y: 80 }, label: 'E-Commerce System', width: 200, height: 40 }
        ],
        edges: [
            { id: 'e1', source: 'a1', target: 'uc1', type: 'straight' },
            { id: 'e2', source: 'a1', target: 'uc2', type: 'straight' },
            { id: 'e3', source: 'a1', target: 'uc3', type: 'straight' },
            { id: 'e4', source: 'a2', target: 'uc1', type: 'straight' },
            { id: 'e5', source: 'a2', target: 'uc4', type: 'straight' }
        ]
    },
    sequence: {
        nodes: [
            { id: 'l1', type: 'lifeline', position: { x: 150, y: 50 }, label: 'User', height: 450, color: 'indigo' },
            { id: 'l2', type: 'lifeline', position: { x: 350, y: 50 }, label: 'Frontend', height: 450, color: 'cyan' },
            { id: 'l3', type: 'lifeline', position: { x: 550, y: 50 }, label: 'API Server', height: 450, color: 'emerald' },
            { id: 'l4', type: 'lifeline', position: { x: 750, y: 50 }, label: 'Database', height: 450, color: 'slate' },

            // Activations
            { id: 'act1', type: 'process', position: { x: 145, y: 120 }, label: '', width: 10, height: 200, color: 'indigo' },
            { id: 'act2', type: 'process', position: { x: 345, y: 140 }, label: '', width: 10, height: 160, color: 'cyan' },
            { id: 'act3', type: 'process', position: { x: 545, y: 160 }, label: '', width: 10, height: 100, color: 'emerald' },
            { id: 'act4', type: 'process', position: { x: 745, y: 180 }, label: '', width: 10, height: 40, color: 'slate' },
        ],
        edges: [
            // We use straight edges to simulate messages manually for now
            // In a real sequence diagram tool, edges connect lifelines at specific Y
            // Here we connect activations or nodes
            // NOTE: Edges currently connect centers. Sequence diagram needs edges connecting specific heights.
            // This is a limitation of the current generic graph engine for Sequence diagrams.
            // We will just place nodes to simulate it or use standard connections.
            // For now, let's just leave lifelines as the template base.
        ]
    },
    mindmap: {
        nodes: [
            { id: 'root', type: 'start-end', position: { x: 400, y: 300 }, label: 'Project\nLaunch', width: 180, height: 90, color: 'indigo' },

            // Right Branch
            { id: 'r1', type: 'process', position: { x: 650, y: 150 }, label: 'Marketing', width: 140, height: 60, color: 'pink' },
            { id: 'r2', type: 'process', position: { x: 650, y: 300 }, label: 'Development', width: 140, height: 60, color: 'cyan' },
            { id: 'r3', type: 'process', position: { x: 650, y: 450 }, label: 'Sales', width: 140, height: 60, color: 'emerald' },

            // Left Branch
            { id: 'l1', type: 'process', position: { x: 150, y: 150 }, label: 'Budget', width: 140, height: 60, color: 'amber' },
            { id: 'l2', type: 'process', position: { x: 150, y: 300 }, label: 'Team', width: 140, height: 60, color: 'purple' },
            { id: 'l3', type: 'process', position: { x: 150, y: 450 }, label: 'Risk', width: 140, height: 60, color: 'red' }
        ],
        edges: [
            { id: 'e1', source: 'root', target: 'r1', type: 'bezier' },
            { id: 'e2', source: 'root', target: 'r2', type: 'bezier' },
            { id: 'e3', source: 'root', target: 'r3', type: 'bezier' },
            { id: 'e4', source: 'root', target: 'l1', type: 'bezier' },
            { id: 'e5', source: 'root', target: 'l2', type: 'bezier' },
            { id: 'e6', source: 'root', target: 'l3', type: 'bezier' }
        ]
    }
};
