import type { DocumentState } from '../stores/document';

const API_BASE = 'http://localhost:8080/api';

export const api = {
	async getDocument(id: string): Promise<DocumentState | null> {
		try {
			const res = await fetch(`${API_BASE}/documents/${id}`);
			if (!res.ok) {
				if (res.status === 404) return null;
				throw new Error(`Failed to fetch document: ${res.statusText}`);
			}
			// Backend returns wrapped response? Check backend handlers if possible.
			// Usually handlers_documents.go returns JSON.
			// Assuming it returns the document json directly or { data: ... }
			// Let's assume it returns { content: JSON_STRING/OBJECT } or just the structure.
			// Adjust based on backend response structure.
			const data = await res.json();

			// If backend stores content as stringified JSON in a 'content' field:
			if (data.content && typeof data.content === 'string') {
				return JSON.parse(data.content);
			}
			// If backend stores content as JSON object in 'content' field:
			if (data.content && typeof data.content === 'object') {
				return data.content;
			}
			// If backend returns the document structure directly (less likely for a generic generic JSON field)
			return data as DocumentState;
		} catch (e) {
			console.error('API Error:', e);
			throw e;
		}
	},

	async saveDocument(id: string, state: DocumentState, title: string = 'Untitled'): Promise<void> {
		// Backend expects { title: string, content: JSON }
		const payload = {
			title,
			content: state // Backend likely handles JSONB or string
		};

		const res = await fetch(`${API_BASE}/documents/${id}`, {
			method: 'PUT', // or POST if creation? internal/http/routes.go says PUT for update
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			throw new Error(`Failed to save document: ${res.statusText}`);
		}
	},

	async createDocument(title: string = 'Untitled'): Promise<{ id: string }> {
		const res = await fetch(`${API_BASE}/documents`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title, content: {} })
		});

		if (!res.ok) throw new Error('Failed to create document');
		return await res.json();
	}
};
