'use client';

import { useEffect, useMemo, useState } from 'react';
import { NODE_SHAPES } from '../../lib/utils/constants.js';
import { documentStore } from '../../lib/stores/document.js';
import { getShapePath } from '../../lib/utils/shapes.js';

const CATEGORY_NAMES = {
	general: 'General',
	flowchart: 'Flowchart',
	arrows: 'Arrows',
	uml: 'UML / Class / Sequence',
	erd: 'Entity Relation',
	bpmn: 'BPMN 2.0',
	network: 'Cloud / Network'
};

export default function EditorSidebar({ diagramType = 'flowchart' }) {
	const [searchQuery, setSearchQuery] = useState('');
	const [expanded, setExpanded] = useState({ tools: false, general: true, [diagramType]: true });
	const categories = useMemo(() => {
		const order = ['general', 'flowchart', 'arrows', 'uml', 'erd', 'bpmn', 'network'];
		const keys = Object.keys(NODE_SHAPES).filter((k) => k !== 'all' && k !== 'blank');
		const filtered = searchQuery ? keys.filter((k) => NODE_SHAPES[k].some((s) => s.label.toLowerCase().includes(searchQuery.toLowerCase()))) : keys;
		return filtered.sort((a, b) => (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b)));
	}, [searchQuery]);

	useEffect(() => {
		if (searchQuery) setExpanded((current) => Object.fromEntries([...Object.keys(current), ...categories].map((key) => [key, true])));
	}, [categories, searchQuery]);

	function addNode(type, label) {
		documentStore.addNode({ id: crypto.randomUUID(), type, position: { x: 200 + Math.random() * 50, y: 150 + Math.random() * 50 }, width: 120, height: 60, label: label || 'New Node' });
	}

	return (
		<aside className="z-10 flex h-full w-60 flex-col border-r border-[#303030] bg-[#1e1e1e] shadow-xl select-none">
			<div className="space-y-3 border-b border-[#303030] px-4 py-3">
				<h3 className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">Shapes</h3>
				<div className="relative">
					<input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded border border-[#3e3e3e] bg-[#2a2a2a] py-1 pr-2 pl-8 text-xs text-gray-300 placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
				</div>
			</div>
			<div className="custom-scrollbar flex-1 overflow-y-auto">
				<div className="border-b border-[#303030]">
					<button className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-[#2a2a2a]" onClick={() => setExpanded((s) => ({ ...s, tools: !s.tools }))}>
						<span>General</span><span className="text-[10px] text-gray-500">{expanded.tools !== false ? '▼' : '▶'}</span>
					</button>
					{expanded.tools !== false ? (
						<div className="grid grid-cols-4 gap-2 bg-[#1e1e1e] p-3">
							<button className="group relative flex flex-col items-center justify-center rounded p-1 text-gray-400 hover:bg-[#303030] hover:text-white" onClick={() => addNode('text', 'Text')} title="Text">T</button>
							<button className="flex flex-col items-center justify-center rounded p-1 text-gray-400 hover:bg-[#303030] hover:text-white" onClick={() => alert('Drag from any node handle to create a connection!')} title="Connection">→</button>
						</div>
					) : null}
				</div>
				{categories.map((catKey) => (
					<div key={catKey} className="border-b border-[#303030]">
						<button className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-[#2a2a2a]" onClick={() => setExpanded((s) => ({ ...s, [catKey]: !s[catKey] }))}>
							<span>{CATEGORY_NAMES[catKey] || catKey}</span><span className="text-[10px] text-gray-500">{expanded[catKey] ? '▼' : '▶'}</span>
						</button>
						{expanded[catKey] ? (
							<div className="grid grid-cols-3 gap-2 bg-[#1e1e1e] p-3">
								{(NODE_SHAPES[catKey] || []).filter((s) => !searchQuery || s.label.toLowerCase().includes(searchQuery.toLowerCase())).map((shape) => (
									<button key={`${catKey}-${shape.type}-${shape.label}`} className="group relative flex flex-col items-center justify-center rounded border border-transparent p-1.5 transition-all hover:border-[#4a4a4a] hover:bg-[#2a2a2a]" onClick={() => addNode(shape.type, shape.label)} title={shape.label} draggable onDragStart={(e) => e.dataTransfer?.setData('application/gradiol-node', JSON.stringify({ type: shape.type, label: shape.label }))}>
										<div className="flex h-8 w-8 items-center justify-center text-gray-400 transition-colors group-hover:text-white">
											{shape.type === 'text' ? <span className="font-serif text-xl font-bold">T</span> : <svg viewBox="0 0 40 40" className="h-7 w-7 fill-none stroke-current opacity-80 group-hover:opacity-100" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><path d={getShapePath(shape.type, 40, 40)} vectorEffect="non-scaling-stroke" /></svg>}
										</div>
										<span className="mt-1 w-full truncate text-center text-[9px] text-gray-500 group-hover:text-gray-300">{shape.label}</span>
									</button>
								))}
							</div>
						) : null}
					</div>
				))}
			</div>
		</aside>
	);
}
