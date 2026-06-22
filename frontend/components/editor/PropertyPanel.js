'use client';

import { useState } from 'react';
import { useStore } from '../../hooks/useStore.js';
import { documentStore } from '../../lib/stores/document.js';
import { selectionStore } from '../../lib/stores/selection.js';

export default function PropertyPanel() {
	const [activeTab, setActiveTab] = useState('style');
	const document = useStore(documentStore);
	const selection = useStore(selectionStore);
	const selectedNodeId = selection.nodes[0];
	const selectedEdgeId = selection.edges[0];
	const selectedNode = selectedNodeId ? document.nodes.find((n) => n.id === selectedNodeId) : null;
	const selectedEdge = selectedEdgeId ? document.edges.find((e) => e.id === selectedEdgeId) : null;

	const updateNode = (prop, value) => selectedNodeId && documentStore.updateNode(selectedNodeId, { [prop]: value });
	const updateNodeStyle = (prop, value) => selectedNodeId && documentStore.updateNode(selectedNodeId, { style: { ...(selectedNode?.style || {}), [prop]: value } });
	const updateEdge = (prop, value) => selectedEdgeId && documentStore.updateEdge(selectedEdgeId, { [prop]: value });
	const updateEdgeStyle = (prop, value) => selectedEdgeId && documentStore.updateEdge(selectedEdgeId, { style: { ...(selectedEdge?.style || {}), [prop]: value } });

	return (
		<div className="flex h-full w-72 flex-col border-l border-slate-700/50 bg-slate-900 shadow-xl">
			<div className="border-b border-slate-700/50 bg-slate-800/50 px-4 py-3">
				<h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Properties</h2>
			</div>
			{selectedNode ? (
				<>
					<div className="flex border-b border-slate-700/50">
						{['style', 'text', 'arrange'].map((tab) => <button key={tab} className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`} onClick={() => setActiveTab(tab)}>{tab}</button>)}
					</div>
					<div className="flex-1 space-y-6 overflow-y-auto p-4">
						{activeTab === 'style' ? (
							<div className="space-y-4">
								<div className="space-y-2">
									<label className="block text-xs font-semibold text-slate-400">Fill</label>
									<div className="flex items-center gap-2"><input type="color" value={selectedNode.style?.fill || '#ffffff'} onChange={(e) => updateNodeStyle('fill', e.target.value)} className="h-8 w-8 cursor-pointer rounded border border-slate-600 bg-slate-800 p-0.5" /><span className="text-xs text-slate-500 uppercase">{selectedNode.style?.fill || '#ffffff'}</span></div>
									<label className="flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={!!selectedNode.style?.gradient} onChange={(e) => updateNodeStyle('gradient', e.target.checked)} />Gradient</label>
								</div>
								<hr className="border-slate-700/50" />
								<div className="space-y-2">
									<label className="block text-xs font-semibold text-slate-400">Border</label>
									<div className="grid grid-cols-2 gap-2"><input type="color" value={selectedNode.style?.stroke || '#000000'} onChange={(e) => updateNodeStyle('stroke', e.target.value)} className="h-8 w-full cursor-pointer rounded border border-slate-600 bg-slate-800 p-0.5" /><input type="number" min="0" max="20" value={selectedNode.style?.strokeWidth ?? 2} onChange={(e) => updateNodeStyle('strokeWidth', +e.target.value)} className="h-8 w-full rounded border-slate-600 bg-slate-800 text-xs text-slate-200" /></div>
									<select value={selectedNode.style?.strokeDasharray || 'none'} onChange={(e) => updateNodeStyle('strokeDasharray', e.target.value)} className="w-full rounded border-slate-600 bg-slate-800 py-1.5 text-xs text-slate-200"><option value="none">Solid</option><option value="5,5">Dashed</option><option value="2,2">Dotted</option></select>
								</div>
								<hr className="border-slate-700/50" />
								<label className="flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={!!selectedNode.style?.shadow} onChange={(e) => updateNodeStyle('shadow', e.target.checked)} />Drop Shadow</label>
								<div className="flex items-center gap-2"><span className="w-12 text-xs text-slate-500">Opacity</span><input type="range" min="0" max="1" step="0.1" value={selectedNode.style?.opacity ?? 1} onChange={(e) => updateNodeStyle('opacity', +e.target.value)} className="h-1.5 flex-1 accent-indigo-500" /><span className="w-6 text-right text-xs text-slate-500">{Math.round((selectedNode.style?.opacity ?? 1) * 100)}%</span></div>
							</div>
						) : activeTab === 'text' ? (
							<div className="space-y-4">
								<label className="block text-xs font-semibold text-slate-400">Label</label>
								<textarea value={selectedNode.label || ''} onChange={(e) => updateNode('label', e.target.value)} className="w-full rounded border-slate-600 bg-slate-800 p-2 text-sm text-slate-200" rows="2"></textarea>
								<select value={selectedNode.style?.fontFamily || 'sans-serif'} onChange={(e) => updateNodeStyle('fontFamily', e.target.value)} className="w-full rounded border-slate-600 bg-slate-800 py-1.5 text-xs text-slate-200"><option value="sans-serif">Sans Serif</option><option value="serif">Serif</option><option value="monospace">Monospace</option></select>
								<input type="number" value={selectedNode.style?.fontSize || 14} onChange={(e) => updateNodeStyle('fontSize', +e.target.value)} className="w-20 rounded border-slate-600 bg-slate-800 text-xs text-slate-200" />
								<div className="flex overflow-hidden rounded border border-slate-600">
									<button className={`px-2 py-1 hover:bg-slate-700 ${selectedNode.style?.fontWeight === 'bold' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400'}`} onClick={() => updateNodeStyle('fontWeight', selectedNode.style?.fontWeight === 'bold' ? 'normal' : 'bold')}><strong>B</strong></button>
									<button className={`px-2 py-1 hover:bg-slate-700 ${selectedNode.style?.fontStyle === 'italic' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400'}`} onClick={() => updateNodeStyle('fontStyle', selectedNode.style?.fontStyle === 'italic' ? 'normal' : 'italic')}><em>I</em></button>
									<button className={`px-2 py-1 hover:bg-slate-700 ${selectedNode.style?.textDecoration === 'underline' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400'}`} onClick={() => updateNodeStyle('textDecoration', selectedNode.style?.textDecoration === 'underline' ? 'none' : 'underline')}><span className="underline">U</span></button>
								</div>
								<input type="color" value={selectedNode.style?.color || (selectedNode.color === 'white' ? '#000000' : '#ffffff')} onChange={(e) => updateNodeStyle('color', e.target.value)} className="h-8 w-8 cursor-pointer rounded border border-slate-600 bg-slate-800 p-0.5" />
							</div>
						) : (
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<input type="number" value={Math.round(selectedNode.position.x)} onChange={(e) => documentStore.updateNode(selectedNodeId, { position: { x: +e.target.value, y: selectedNode.position.y } })} className="w-full rounded border-slate-600 bg-slate-800 p-1 text-xs text-slate-200" />
									<input type="number" value={Math.round(selectedNode.position.y)} onChange={(e) => documentStore.updateNode(selectedNodeId, { position: { x: selectedNode.position.x, y: +e.target.value } })} className="w-full rounded border-slate-600 bg-slate-800 p-1 text-xs text-slate-200" />
									<input type="number" value={selectedNode.width || 120} onChange={(e) => updateNode('width', +e.target.value)} className="w-full rounded border-slate-600 bg-slate-800 p-1 text-xs text-slate-200" />
									<input type="number" value={selectedNode.height || 60} onChange={(e) => updateNode('height', +e.target.value)} className="w-full rounded border-slate-600 bg-slate-800 p-1 text-xs text-slate-200" />
								</div>
								<div className="grid grid-cols-2 gap-2"><button className="rounded border border-slate-600 py-1 text-xs text-slate-300 hover:bg-slate-700" onClick={() => documentStore.moveNodeOrder(selectedNodeId, 'front')}>Bring to Front</button><button className="rounded border border-slate-600 py-1 text-xs text-slate-300 hover:bg-slate-700" onClick={() => documentStore.moveNodeOrder(selectedNodeId, 'back')}>Send to Back</button></div>
								<label className="flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={!!selectedNode.locked} onChange={(e) => updateNode('locked', e.target.checked)} />Lock Position</label>
							</div>
						)}
					</div>
				</>
			) : selectedEdge ? (
				<div className="space-y-4 p-4 text-slate-200">
					<select value={selectedEdge.type || 'default'} onChange={(e) => updateEdge('type', e.target.value)} className="w-full rounded border-slate-600 bg-slate-800 py-1.5 text-xs text-slate-200"><option value="default">Bezier (Smooth)</option><option value="step">Step (Orthogonal)</option><option value="straight">Straight</option></select>
					<input type="color" value={selectedEdge.style?.stroke || '#64748b'} onChange={(e) => updateEdgeStyle('stroke', e.target.value)} />
					<input type="number" min="1" max="10" value={selectedEdge.style?.strokeWidth ?? 2} onChange={(e) => updateEdgeStyle('strokeWidth', +e.target.value)} className="h-8 rounded border-slate-600 bg-slate-800 text-xs text-slate-200" />
					<label className="flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={!!selectedEdge.animated} onChange={(e) => updateEdge('animated', e.target.checked)} />Animated</label>
				</div>
			) : (
				<div className="flex flex-1 items-center justify-center p-8 text-center text-slate-500"><p className="text-sm">Select an item to edit properties</p></div>
			)}
		</div>
	);
}
