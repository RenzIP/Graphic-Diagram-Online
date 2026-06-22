import { d as derived, w as writable } from "./index.js";
import { a as api, A as ApiError } from "./client2.js";
const API_BASE = "http://localhost:8080";
const LOGIN_ENDPOINTS = ["/auth/login", "/login"];
const REGISTER_ENDPOINTS = ["/auth/register", "/register"];
function normalizeAuthSession(payload) {
  const token = payload?.token ?? payload?.access_token ?? payload?.data?.token;
  const user = payload?.user ?? payload?.data?.user ?? payload?.profile;
  if (!token || !user) {
    throw new ApiError(500, "Response autentikasi backend tidak lengkap.");
  }
  return {
    token,
    user
  };
}
async function postToFirstAvailable(endpoints, body) {
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await api.post(endpoint, body);
      return normalizeAuthSession(response);
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError && error.status === 404) {
        continue;
      }
      throw error;
    }
  }
  if (lastError instanceof ApiError && lastError.status === 404) {
    throw new ApiError(
      404,
      "Backend saat ini belum menyediakan endpoint login/register berbasis credential."
    );
  }
  return null;
}
const authApi = {
  /** Get current authenticated user's profile */
  me: () => api.get("/auth/me"),
  /** Login with email/password JWT flow when available */
  login: (payload) => postToFirstAvailable(LOGIN_ENDPOINTS, payload),
  /** Register with email/password JWT flow when available */
  register: (payload) => postToFirstAvailable(REGISTER_ENDPOINTS, payload),
  /** Get the URL to redirect to for Google OAuth login */
  getGoogleLoginUrl: () => `${API_BASE}/api/auth/google`,
  /** Get the URL to redirect to for GitHub OAuth login */
  getGitHubLoginUrl: () => `${API_BASE}/api/auth/github`
};
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};
const authState = writable(initialState);
const currentUser = derived(authState, ($s) => $s.user);
derived(authState, ($s) => $s.isAuthenticated);
derived(authState, ($s) => $s.isLoading);
function initAuth() {
  const existingToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (existingToken) {
    loadUserProfile();
  } else {
    authState.update((s) => ({ ...s, isLoading: false }));
  }
}
async function loadUserProfile() {
  try {
    const user = await authApi.me();
    authState.set({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  } catch {
    clearAuthData();
    authState.set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }
}
function setAuthUser(user, token) {
  storeAuthData(token);
  authState.set({
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null
  });
}
function applyAuthSession(session) {
  setAuthUser(session.user, session.token);
}
function storeAuthData(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
}
function clearAuthData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
}
({
  subscribe: authState.subscribe
});
export {
  applyAuthSession as a,
  authApi as b,
  currentUser as c,
  initAuth as i
};
