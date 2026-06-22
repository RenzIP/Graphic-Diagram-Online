'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppSidebar from '../../../../components/layout/AppSidebar.js';
import Button from '../../../../components/ui/Button.js';
import Card from '../../../../components/ui/Card.js';
import Input from '../../../../components/ui/Input.js';
import Modal from '../../../../components/ui/Modal.js';
import { DIAGRAM_TYPES } from '../../../../lib/utils/constants.js';
import { documentsApi } from '../../../../lib/api/documents.js';
import { projectsApi } from '../../../../lib/api/projects.js';
import { workspacesApi } from '../../../../lib/api/workspaces.js';

function timeAgo(dateStr) {
	const now = new Date();
	const date = new Date(dateStr);
	const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
	if (diff < 60) return 'just now';
	if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
	return `${Math.floor(diff / 86400)} days ago`;
}

export default function WorkspacePage() {
	const params = useParams();
	const workspaceId = params.id;
	const [workspace, setWorkspace] = useState(null);
	const [loading, setLoading] = useState(true);
	const [projects, setProjects] = useState([]);
	const [showNewProjectModal, setShowNewProjectModal] = useState(false);
	const [newProjectName, setNewProjectName] = useState('');
	const [newProjectDescription, setNewProjectDescription] = useState('');
	const [creatingProject, setCreatingProject] = useState(false);
	const [showNewDocModal, setShowNewDocModal] = useState(false);
	const [newDocProjectId, setNewDocProjectId] = useState('');
	const [newDocTitle, setNewDocTitle] = useState('');
	const [creatingDoc, setCreatingDoc] = useState(false);

	useEffect(() => {
		Promise.all([workspacesApi.list({ per_page: 100 }), projectsApi.listByWorkspace(workspaceId, { per_page: 50 })])
			.then(([wsRes, projRes]) => {
				setWorkspace(wsRes.data.find((w) => w.id === workspaceId) ?? null);
				setProjects(projRes.data ?? []);
			})
			.catch((e) => {
				console.error('Failed to load workspace:', e);
				setProjects([]);
			})
			.finally(() => setLoading(false));
	}, [workspaceId]);

	async function createProject() {
		if (!newProjectName.trim()) return;
		setCreatingProject(true);
		try {
			const project = await projectsApi.create({ workspace_id: workspaceId, name: newProjectName.trim(), description: newProjectDescription.trim() || undefined });
			setProjects((items) => [...items, project]);
			setShowNewProjectModal(false);
			setNewProjectName('');
			setNewProjectDescription('');
		} catch (e) {
			console.error('Failed to create project:', e);
		} finally {
			setCreatingProject(false);
		}
	}

	async function deleteProject(id, name) {
		if (!confirm(`Delete project "${name}" and all its documents?`)) return;
		try {
			await projectsApi.delete(id);
			setProjects((items) => items.filter((p) => p.id !== id));
		} catch (e) {
			console.error('Failed to delete project:', e);
		}
	}

	async function createDocument(typeId) {
		if (!newDocProjectId) return;
		setCreatingDoc(true);
		try {
			const doc = await documentsApi.create({ workspace_id: workspaceId, project_id: newDocProjectId, title: newDocTitle.trim() || 'Untitled', diagram_type: typeId });
			setShowNewDocModal(false);
			setNewDocTitle('');
			window.location.href = `/editor/${doc.id}`;
		} catch (e) {
			console.error('Failed to create document:', e);
		} finally {
			setCreatingDoc(false);
		}
	}

	return (
		<div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
			<AppSidebar />
			<main className="flex min-h-0 flex-1 flex-col overflow-hidden">
				<header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-8">
					<div className="flex items-center gap-4">
						<nav className="flex items-center text-sm text-slate-500">
							<a href="/dashboard" className="transition-colors hover:text-white">Dashboard</a>
							<svg className="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
							<span className="font-medium text-white">{workspace?.name ?? 'Workspace'}</span>
						</nav>
					</div>
					{workspace?.role === 'owner' || workspace?.role === 'editor' ? <Button variant="primary" size="sm" onClick={() => setShowNewProjectModal(true)}>New Project</Button> : null}
				</header>

				<div className="flex-1 overflow-y-auto p-8">
					{workspace?.description ? <p className="mb-6 text-sm text-slate-400">{workspace.description}</p> : null}
					<div className="mb-6 flex items-center justify-between">
						<h1 className="text-2xl font-bold text-white">Projects</h1>
						<span className="text-sm text-slate-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
					</div>
					{loading ? (
						<div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500"></div><span className="ml-3 text-sm text-slate-500">Loading projects...</span></div>
					) : (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{projects.map((project) => (
								<Card key={project.id} className="group relative cursor-pointer overflow-hidden p-0 transition-colors hover:border-slate-600">
									<div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
									<div className="p-6">
										<div className="mb-4 flex items-start justify-between">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400"></div>
											<div className="flex gap-1">
												<button className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-indigo-400" title="Add document" onClick={(e) => { e.stopPropagation(); setNewDocProjectId(project.id); setShowNewDocModal(true); }}>+</button>
												<button className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-red-400" title="Delete project" onClick={(e) => { e.stopPropagation(); deleteProject(project.id, project.name); }}>×</button>
											</div>
										</div>
										<h3 className="mb-1 text-lg font-bold text-white transition-colors group-hover:text-indigo-400">{project.name}</h3>
										{project.description ? <p className="mb-2 line-clamp-2 text-sm text-slate-400">{project.description}</p> : null}
										<div className="flex items-center gap-4 text-sm text-slate-500">
											<span>{project.document_count} document{project.document_count !== 1 ? 's' : ''}</span>
											<span>Updated {timeAgo(project.updated_at)}</span>
										</div>
									</div>
								</Card>
							))}
							<button className="flex h-full min-h-[160px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-800 p-6 text-slate-500 transition-all hover:border-indigo-500/50 hover:bg-slate-900/50 hover:text-indigo-400" onClick={() => setShowNewProjectModal(true)}>
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">+</div>
								<span className="font-medium">Create New Project</span>
							</button>
						</div>
					)}
				</div>
			</main>

			<Modal open={showNewProjectModal} onClose={() => setShowNewProjectModal(false)}>
				<div className="p-6">
					<h3 className="mb-4 text-lg font-semibold text-white">Create New Project</h3>
					<form className="space-y-3" onSubmit={(e) => { e.preventDefault(); createProject(); }}>
						<Input label="Project Name" placeholder="My Project" value={newProjectName} onChange={setNewProjectName} />
						<div>
							<label htmlFor="proj-desc" className="mb-1 block text-sm text-slate-400">Description (optional)</label>
							<textarea id="proj-desc" value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} rows={3} placeholder="What is this project about?" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"></textarea>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<Button variant="ghost" size="sm" onClick={() => setShowNewProjectModal(false)}>Cancel</Button>
							<Button variant="primary" size="sm" type="submit" disabled={creatingProject || !newProjectName.trim()}>{creatingProject ? 'Creating...' : 'Create Project'}</Button>
						</div>
					</form>
				</div>
			</Modal>

			<Modal open={showNewDocModal} onClose={() => setShowNewDocModal(false)}>
				<div className="p-6">
					<h3 className="mb-4 text-lg font-semibold text-white">Create Document</h3>
					<div className="mb-4"><Input label="Title" placeholder="Untitled" value={newDocTitle} onChange={setNewDocTitle} /></div>
					<label className="mb-2 block text-sm text-slate-400">Diagram Type</label>
					<div className="grid grid-cols-3 gap-2">
						{DIAGRAM_TYPES.map((dt) => <button key={dt.id} className="flex flex-col items-center rounded-lg border border-slate-700 bg-slate-800 p-3 text-center transition-colors hover:border-indigo-500 hover:bg-slate-700" onClick={() => createDocument(dt.id)} disabled={creatingDoc}><span className="mb-1 text-xl">{dt.icon}</span><span className="text-xs text-slate-300">{dt.name}</span></button>)}
					</div>
				</div>
			</Modal>
		</div>
	);
}
