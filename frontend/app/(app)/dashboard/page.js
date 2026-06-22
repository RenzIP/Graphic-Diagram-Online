'use client';

import { useEffect, useMemo, useState } from 'react';
import AppSidebar from '../../../components/layout/AppSidebar.js';
import Button from '../../../components/ui/Button.js';
import Card from '../../../components/ui/Card.js';
import Input from '../../../components/ui/Input.js';
import Modal from '../../../components/ui/Modal.js';
import { DIAGRAM_TYPES } from '../../../lib/utils/constants.js';
import { documentsApi } from '../../../lib/api/documents.js';
import { workspacesApi } from '../../../lib/api/workspaces.js';

const typeColors = { flowchart: 'indigo', erd: 'purple', usecase: 'cyan' };

function timeAgo(dateStr) {
	const now = new Date();
	const date = new Date(dateStr);
	const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
	if (diff < 60) return 'just now';
	if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
	return `${Math.floor(diff / 86400)} days ago`;
}

export default function DashboardPage() {
	const [searchQuery, setSearchQuery] = useState('');
	const [showNewDiagramModal, setShowNewDiagramModal] = useState(false);
	const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [recentDocs, setRecentDocs] = useState([]);
	const [workspaces, setWorkspaces] = useState([]);
	const [newWsName, setNewWsName] = useState('');
	const [newWsDescription, setNewWsDescription] = useState('');
	const [creatingWs, setCreatingWs] = useState(false);
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
	const [newDiagramTitle, setNewDiagramTitle] = useState('');
	const [creatingDiagram, setCreatingDiagram] = useState(false);

	useEffect(() => {
		Promise.all([documentsApi.recent(10), workspacesApi.list({ per_page: 50 })])
			.then(([recentRes, wsRes]) => {
				setRecentDocs(recentRes ?? []);
				setWorkspaces(wsRes.data ?? []);
				if (wsRes.data?.length > 0) setSelectedWorkspaceId(wsRes.data[0].id);
			})
			.catch((e) => {
				console.error('Failed to load dashboard data:', e);
				setRecentDocs([]);
				setWorkspaces([]);
			})
			.finally(() => setLoading(false));
	}, []);

	const filteredDocs = useMemo(() => {
		if (!searchQuery) return recentDocs;
		const query = searchQuery.toLowerCase();
		return recentDocs.filter((d) => d.title.toLowerCase().includes(query) || d.diagram_type.toLowerCase().includes(query) || (d.workspace_name?.toLowerCase().includes(query) ?? false));
	}, [recentDocs, searchQuery]);

	async function createDiagram(typeId) {
		if (!selectedWorkspaceId) {
			setShowNewDiagramModal(false);
			setShowNewWorkspaceModal(true);
			return;
		}
		setCreatingDiagram(true);
		try {
			const doc = await documentsApi.create({
				workspace_id: selectedWorkspaceId,
				title: newDiagramTitle.trim() || 'Untitled',
				diagram_type: typeId
			});
			setShowNewDiagramModal(false);
			setNewDiagramTitle('');
			window.location.href = `/editor/${doc.id}`;
		} catch (e) {
			console.error('Failed to create diagram:', e);
		} finally {
			setCreatingDiagram(false);
		}
	}

	async function createWorkspace() {
		if (!newWsName.trim()) return;
		setCreatingWs(true);
		try {
			const ws = await workspacesApi.create({ name: newWsName.trim(), description: newWsDescription.trim() || undefined });
			setWorkspaces((items) => [...items, ws]);
			if (!selectedWorkspaceId) setSelectedWorkspaceId(ws.id);
			setShowNewWorkspaceModal(false);
			setNewWsName('');
			setNewWsDescription('');
		} catch (e) {
			console.error('Failed to create workspace:', e);
		} finally {
			setCreatingWs(false);
		}
	}

	return (
		<div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
			<AppSidebar />
			<main className="flex min-h-0 flex-1 flex-col overflow-hidden">
				<header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-8">
					<h1 className="text-xl font-bold text-white">Dashboard</h1>
					<div className="flex w-1/3 items-center gap-4">
						<div className="relative w-full">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
							</div>
							<input type="text" placeholder="Search diagrams..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pr-4 pl-10 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none" />
						</div>
						<Button variant="primary" size="sm" onClick={() => setShowNewDiagramModal(true)}>New Diagram</Button>
					</div>
				</header>

				<div className="flex-1 overflow-y-auto p-8">
					<section className="mb-12">
						<h2 className="mb-4 text-lg font-semibold text-white">Start from template</h2>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
							<button className="group flex flex-col items-center rounded-xl border border-dashed border-slate-700 p-4 text-left transition-colors hover:border-indigo-500 hover:bg-slate-900" onClick={() => setShowNewDiagramModal(true)}>
								<div className="mb-3 flex aspect-video w-full items-center justify-center rounded-lg bg-indigo-500/10 transition-colors group-hover:bg-indigo-500/20">+</div>
								<span className="text-sm font-medium text-slate-300 group-hover:text-white">Blank Diagram</span>
							</button>
							{DIAGRAM_TYPES.map((template) => (
								<button key={template.id} className="group flex flex-col items-center rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition-colors hover:border-slate-600" onClick={() => createDiagram(template.id)}>
									<div className="relative mb-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-slate-800">
										<span className="text-2xl opacity-40 transition-opacity group-hover:opacity-70">{template.icon}</span>
									</div>
									<span className="text-sm font-medium text-slate-300 group-hover:text-white">{template.name}</span>
								</button>
							))}
						</div>
					</section>

					<section>
						<div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-white">Recent Diagrams</h2></div>
						{loading ? (
							<div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500"></div><span className="ml-3 text-sm text-slate-500">Loading diagrams...</span></div>
						) : filteredDocs.length === 0 ? (
							<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-16">
								<p className="text-sm text-slate-500">{searchQuery ? 'No diagrams match your search' : 'No diagrams yet. Create your first one above!'}</p>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{filteredDocs.map((doc) => {
									const color = typeColors[doc.diagram_type] || 'slate';
									return (
										<Card key={doc.id} className="group relative cursor-pointer transition-colors hover:border-slate-600" onClick={() => (window.location.href = `/editor/${doc.id}`)}>
											<div className="relative aspect-video overflow-hidden border-b border-slate-800 bg-slate-900">
												<div className={`absolute inset-0 bg-${color}-500/5 transition-colors group-hover:bg-${color}-500/10`}></div>
											</div>
											<div className="p-4">
												<div className="flex items-start justify-between">
													<div className="min-w-0 flex-1">
														<h3 className="truncate font-medium text-slate-200 transition-colors group-hover:text-indigo-400">{doc.title}</h3>
														<p className="mt-1 text-xs text-slate-500">{doc.workspace_name}{doc.project_name ? ` / ${doc.project_name}` : ''} · {timeAgo(doc.updated_at)}</p>
													</div>
													<span className="ml-2 shrink-0 rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-400 uppercase">{doc.diagram_type}</span>
												</div>
											</div>
										</Card>
									);
								})}
							</div>
						)}
					</section>
				</div>
			</main>

			<Modal open={showNewDiagramModal} onClose={() => setShowNewDiagramModal(false)}>
				<div className="p-6">
					<h3 className="mb-4 text-lg font-semibold text-white">Create New Diagram</h3>
					{workspaces.length === 0 ? (
						<p className="mb-4 text-sm text-slate-400">You need a workspace first. <button className="text-indigo-400 hover:text-indigo-300" onClick={() => { setShowNewDiagramModal(false); setShowNewWorkspaceModal(true); }}>Create one</button></p>
					) : (
						<>
							<div className="mb-4 space-y-3">
								<Input label="Title" placeholder="Untitled" value={newDiagramTitle} onChange={setNewDiagramTitle} />
								<div>
									<label htmlFor="ws-select" className="mb-1 block text-sm text-slate-400">Workspace</label>
									<select id="ws-select" value={selectedWorkspaceId} onChange={(e) => setSelectedWorkspaceId(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none">
										{workspaces.map((ws) => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
									</select>
								</div>
							</div>
							<div className="mb-4">
								<label className="mb-2 block text-sm text-slate-400">Diagram Type</label>
								<div className="grid grid-cols-3 gap-2">
									{DIAGRAM_TYPES.map((dt) => <button key={dt.id} className="flex flex-col items-center rounded-lg border border-slate-700 bg-slate-800 p-3 text-center transition-colors hover:border-indigo-500 hover:bg-slate-700" onClick={() => createDiagram(dt.id)} disabled={creatingDiagram}><span className="mb-1 text-xl">{dt.icon}</span><span className="text-xs text-slate-300">{dt.name}</span></button>)}
								</div>
							</div>
						</>
					)}
				</div>
			</Modal>

			<Modal open={showNewWorkspaceModal} onClose={() => setShowNewWorkspaceModal(false)}>
				<div className="p-6">
					<h3 className="mb-4 text-lg font-semibold text-white">Create Workspace</h3>
					<form className="space-y-3" onSubmit={(e) => { e.preventDefault(); createWorkspace(); }}>
						<Input label="Workspace Name" placeholder="My Workspace" value={newWsName} onChange={setNewWsName} />
						<div>
							<label htmlFor="ws-desc" className="mb-1 block text-sm text-slate-400">Description (optional)</label>
							<textarea id="ws-desc" value={newWsDescription} onChange={(e) => setNewWsDescription(e.target.value)} rows={3} placeholder="What is this workspace for?" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"></textarea>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<Button variant="ghost" size="sm" onClick={() => setShowNewWorkspaceModal(false)}>Cancel</Button>
							<Button variant="primary" size="sm" type="submit" disabled={creatingWs || !newWsName.trim()}>{creatingWs ? 'Creating...' : 'Create'}</Button>
						</div>
					</form>
				</div>
			</Modal>
		</div>
	);
}
