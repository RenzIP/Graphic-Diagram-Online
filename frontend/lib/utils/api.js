const API_BASE = "http://localhost:8080/api";
const api = {
  async getDocument(id) {
    try {
      const res = await fetch(`${API_BASE}/documents/${id}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch document: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.content && typeof data.content === "string") {
        return JSON.parse(data.content);
      }
      if (data.content && typeof data.content === "object") {
        return data.content;
      }
      return data;
    } catch (e) {
      console.error("API Error:", e);
      throw e;
    }
  },
  async saveDocument(id, state, title = "Untitled") {
    const payload = {
      title,
      content: state
      // Backend likely handles JSONB or string
    };
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: "PUT",
      // or POST if creation? internal/http/routes.go says PUT for update
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`Failed to save document: ${res.statusText}`);
    }
  },
  async createDocument(title = "Untitled") {
    const res = await fetch(`${API_BASE}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: {} })
    });
    if (!res.ok) throw new Error("Failed to create document");
    return await res.json();
  }
};
export {
  api
};
