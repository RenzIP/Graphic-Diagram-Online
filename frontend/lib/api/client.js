const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}
function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}
async function request(endpoint, options = {}) {
  const { params, ...fetchOptions } = options;
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    ...fetchOptions,
    headers
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    throw new ApiError(
      response.status,
      errorData?.message || `Request failed: ${response.statusText}`,
      errorData
    );
  }
  if (response.status === 204) return void 0;
  return response.json();
}
const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: "DELETE" })
};
export {
  API_BASE_URL,
  ApiError,
  api,
  getAuthToken
};
