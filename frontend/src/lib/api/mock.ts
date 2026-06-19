/**
 * GraDiOl Mock API Layer
 * Runs entirely in-browser using localStorage to bypass the need for a running backend.
 * Enabled when localStorage.getItem('use_mock_api') === 'true'.
 */
import type { 
	AuthUser, 
	Workspace, 
	Project, 
	DocumentMeta, 
	DocumentFull, 
	RecentDocumentItem,
	PaginatedResponse
} from './types';

const MOCK_USER: AuthUser = {
	id: 'mock-user-123',
	email: 'demo@example.com',
	full_name: 'Demo User',
	avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
};

// Helper: Get item from localStorage with default value
function getStorageItem<T>(key: string, defaultValue: T): T {
	if (typeof window === 'undefined') return defaultValue;
	const val = localStorage.getItem(key);
	if (!val) {
		localStorage.setItem(key, JSON.stringify(defaultValue));
		return defaultValue;
	}
	try {
		return JSON.parse(val);
	} catch {
		return defaultValue;
	}
}

// Helper: Save item to localStorage
function saveStorageItem<T>(key: string, val: T): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(key, JSON.stringify(val));
}

// Initial Data seeds
const INITIAL_WORKSPACES: Workspace[] = [
	{
		id: 'mock-workspace-1',
		name: 'Workspace Utama',
		slug: 'workspace-utama',
		owner_id: MOCK_USER.id,
		description: 'Workspace default untuk membuat dan mengelola diagram Anda',
		role: 'owner',
		member_count: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	}
];

const INITIAL_PROJECTS: Project[] = [
	{
		id: 'mock-project-1',
		workspace_id: 'mock-workspace-1',
		name: 'Diagram Sistem Web',
		description: 'Kumpulan diagram arsitektur untuk sistem web utama',
		document_count: 1,
		created_by: MOCK_USER.id,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	}
];

const INITIAL_DOCUMENTS: DocumentFull[] = [
	{
		id: 'mock-doc-1',
		workspace_id: 'mock-workspace-1',
		project_id: 'mock-project-1',
		title: 'Arsitektur Sistem (Flowchart)',
		diagram_type: 'flowchart',
		version: 1,
		created_by: MOCK_USER.id,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		content: {
			nodes: [
				{ id: '1', type: 'process', label: 'Pengguna Membuka Web', properties: {} },
				{ id: '2', type: 'decision', label: 'Sudah Login?', properties: {} },
				{ id: '3', type: 'process', label: 'Tampilkan Dashboard', properties: {} },
				{ id: '4', type: 'process', label: 'Redirect ke Halaman Login', properties: {} }
			],
			edges: [
				{ id: 'e1', source: '1', target: '2', label: '' },
				{ id: 'e2', source: '2', target: '3', label: 'Ya' },
				{ id: 'e3', source: '2', target: '4', label: 'Tidak' }
			]
		},
		view: {
			positions: {
				'1': { x: 300, y: 100 },
				'2': { x: 300, y: 220 },
				'3': { x: 150, y: 360 },
				'4': { x: 450, y: 360 }
			},
			styles: {
				'1': { fill: '#1e293b', stroke: '#38bdf8' },
				'2': { fill: '#1e293b', stroke: '#fbbf24' },
				'3': { fill: '#1e293b', stroke: '#4ade80' },
				'4': { fill: '#1e293b', stroke: '#f87171' }
			},
			routing: {}
		}
	}
];

export async function handleMockRequest<T>(endpoint: string, options: any = {}): Promise<T> {
	// Add artificial delay to simulate network latency
	await new Promise((resolve) => setTimeout(resolve, 300));

	const method = options.method || 'GET';
	const body = options.body ? JSON.parse(options.body) : null;

	// ── Auth Endpoints ─────────────────────────────────────
	if (endpoint === '/auth/me') {
		return MOCK_USER as unknown as T;
	}

	if (endpoint === '/auth/login' || endpoint === '/login' || endpoint === '/auth/register' || endpoint === '/register') {
		return {
			token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXVzZXItMTIzIiwibmFtZSI6IkRlbW8gVXNlciIsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiJ9.mocksignature',
			user: MOCK_USER
		} as unknown as T;
	}

	// ── Workspaces Endpoints ────────────────────────────────
	if (endpoint === '/workspaces' && method === 'GET') {
		const list = getStorageItem<Workspace[]>('mock_workspaces', INITIAL_WORKSPACES);
		return {
			data: list,
			meta: {
				page: 1,
				per_page: 20,
				total: list.length,
				total_pages: 1
			}
		} as unknown as T;
	}

	if (endpoint === '/workspaces' && method === 'POST') {
		const list = getStorageItem<Workspace[]>('mock_workspaces', INITIAL_WORKSPACES);
		const newWS: Workspace = {
			id: 'mock-workspace-' + Math.random().toString(36).substring(2, 9),
			name: body.name,
			slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
			owner_id: MOCK_USER.id,
			description: body.description || null,
			role: 'owner',
			member_count: 1,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
		list.push(newWS);
		saveStorageItem('mock_workspaces', list);
		return newWS as unknown as T;
	}

	if (endpoint.startsWith('/workspaces/') && method === 'PUT') {
		const id = endpoint.split('/')[2];
		const list = getStorageItem<Workspace[]>('mock_workspaces', INITIAL_WORKSPACES);
		const idx = list.findIndex(w => w.id === id);
		if (idx !== -1) {
			list[idx] = {
				...list[idx],
				...body,
				updated_at: new Date().toISOString()
			};
			saveStorageItem('mock_workspaces', list);
			return list[idx] as unknown as T;
		}
		throw new Error('Workspace not found');
	}

	if (endpoint.startsWith('/workspaces/') && method === 'DELETE') {
		const id = endpoint.split('/')[2];
		const list = getStorageItem<Workspace[]>('mock_workspaces', INITIAL_WORKSPACES);
		const filtered = list.filter(w => w.id !== id);
		saveStorageItem('mock_workspaces', filtered);
		return {} as unknown as T;
	}

	// ── Projects Endpoints ─────────────────────────────────
	// Pattern: GET /workspaces/:id/projects
	const workspaceProjectsMatch = endpoint.match(/^\/workspaces\/([^\/]+)\/projects$/);
	if (workspaceProjectsMatch && method === 'GET') {
		const wsId = workspaceProjectsMatch[1];
		const projects = getStorageItem<Project[]>('mock_projects', INITIAL_PROJECTS);
		const filtered = projects.filter(p => p.workspace_id === wsId);
		return {
			data: filtered,
			meta: {
				page: 1,
				per_page: 20,
				total: filtered.length,
				total_pages: 1
			}
		} as unknown as T;
	}

	if (endpoint === '/projects' && method === 'POST') {
		const projects = getStorageItem<Project[]>('mock_projects', INITIAL_PROJECTS);
		const newProj: Project = {
			id: 'mock-project-' + Math.random().toString(36).substring(2, 9),
			workspace_id: body.workspace_id,
			name: body.name,
			description: body.description || null,
			document_count: 0,
			created_by: MOCK_USER.id,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
		projects.push(newProj);
		saveStorageItem('mock_projects', projects);
		return newProj as unknown as T;
	}

	if (endpoint.startsWith('/projects/') && method === 'PUT') {
		const id = endpoint.split('/')[2];
		const projects = getStorageItem<Project[]>('mock_projects', INITIAL_PROJECTS);
		const idx = projects.findIndex(p => p.id === id);
		if (idx !== -1) {
			projects[idx] = {
				...projects[idx],
				...body,
				updated_at: new Date().toISOString()
			};
			saveStorageItem('mock_projects', projects);
			return projects[idx] as unknown as T;
		}
		throw new Error('Project not found');
	}

	if (endpoint.startsWith('/projects/') && method === 'DELETE') {
		const id = endpoint.split('/')[2];
		const projects = getStorageItem<Project[]>('mock_projects', INITIAL_PROJECTS);
		const filtered = projects.filter(p => p.id !== id);
		saveStorageItem('mock_projects', filtered);
		return {} as unknown as T;
	}

	// ── Documents Endpoints ────────────────────────────────
	// Pattern: GET /projects/:id/documents
	const projectDocsMatch = endpoint.match(/^\/projects\/([^\/]+)\/documents$/);
	if (projectDocsMatch && method === 'GET') {
		const projId = projectDocsMatch[1];
		const docs = getStorageItem<DocumentFull[]>('mock_documents', INITIAL_DOCUMENTS);
		const filtered = docs.filter(d => d.project_id === projId);

		// Transform to DocumentMeta list
		const metaList: DocumentMeta[] = filtered.map(d => {
			const { content, view, ...meta } = d;
			return meta;
		});

		return {
			data: metaList,
			meta: {
				page: 1,
				per_page: 20,
				total: metaList.length,
				total_pages: 1
			}
		} as unknown as T;
	}

	if (endpoint === '/documents' && method === 'POST') {
		const docs = getStorageItem<DocumentFull[]>('mock_documents', INITIAL_DOCUMENTS);
		const newDoc: DocumentFull = {
			id: 'mock-doc-' + Math.random().toString(36).substring(2, 9),
			workspace_id: body.workspace_id,
			project_id: body.project_id || null,
			title: body.title || 'Untitled Diagram',
			diagram_type: body.diagram_type || 'flowchart',
			version: 1,
			created_by: MOCK_USER.id,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			content: body.content || { nodes: [], edges: [] },
			view: body.view || { positions: {}, styles: {}, routing: {} }
		};
		docs.push(newDoc);
		saveStorageItem('mock_documents', docs);

		// Increment project count
		if (newDoc.project_id) {
			const projects = getStorageItem<Project[]>('mock_projects', INITIAL_PROJECTS);
			const pIdx = projects.findIndex(p => p.id === newDoc.project_id);
			if (pIdx !== -1) {
				projects[pIdx].document_count += 1;
				saveStorageItem('mock_projects', projects);
			}
		}

		return newDoc as unknown as T;
	}

	if (endpoint.startsWith('/documents/') && method === 'GET') {
		const id = endpoint.split('/')[2];
		const docs = getStorageItem<DocumentFull[]>('mock_documents', INITIAL_DOCUMENTS);
		const doc = docs.find(d => d.id === id);
		if (doc) {
			return doc as unknown as T;
		}
		throw new Error('Document not found');
	}

	if (endpoint.startsWith('/documents/') && method === 'PUT') {
		const id = endpoint.split('/')[2];
		const docs = getStorageItem<DocumentFull[]>('mock_documents', INITIAL_DOCUMENTS);
		const idx = docs.findIndex(d => d.id === id);
		if (idx !== -1) {
			docs[idx] = {
				...docs[idx],
				...body,
				updated_at: new Date().toISOString()
			};
			saveStorageItem('mock_documents', docs);
			return docs[idx] as unknown as T;
		}
		throw new Error('Document not found');
	}

	if (endpoint.startsWith('/documents/') && method === 'DELETE') {
		const id = endpoint.split('/')[2];
		const docs = getStorageItem<DocumentFull[]>('mock_documents', INITIAL_DOCUMENTS);
		const doc = docs.find(d => d.id === id);
		const filtered = docs.filter(d => d.id !== id);
		saveStorageItem('mock_documents', filtered);

		// Decrement project count
		if (doc && doc.project_id) {
			const projects = getStorageItem<Project[]>('mock_projects', INITIAL_PROJECTS);
			const pIdx = projects.findIndex(p => p.id === doc.project_id);
			if (pIdx !== -1) {
				projects[pIdx].document_count = Math.max(0, projects[pIdx].document_count - 1);
				saveStorageItem('mock_projects', projects);
			}
		}

		return {} as unknown as T;
	}

	if (endpoint.startsWith('/documents/recent') && method === 'GET') {
		const docs = getStorageItem<DocumentFull[]>('mock_documents', INITIAL_DOCUMENTS);
		const workspaces = getStorageItem<Workspace[]>('mock_workspaces', INITIAL_WORKSPACES);
		const projects = getStorageItem<Project[]>('mock_projects', INITIAL_PROJECTS);

		// Sort by updated_at descending
		const sorted = [...docs].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

		// Map to RecentDocumentItem
		const recentList: RecentDocumentItem[] = sorted.slice(0, 10).map(d => {
			const ws = workspaces.find(w => w.id === d.workspace_id);
			const proj = projects.find(p => p.id === d.project_id);
			return {
				id: d.id,
				title: d.title,
				diagram_type: d.diagram_type,
				workspace_id: d.workspace_id,
				workspace_name: ws ? ws.name : 'Unknown Workspace',
				project_id: d.project_id,
				project_name: proj ? proj.name : null,
				updated_at: d.updated_at
			};
		});

		return recentList as unknown as T;
	}

	throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
}
