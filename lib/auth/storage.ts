/**
 * Token persistence for the FastAPI bearer-token flow.
 *
 * Security tradeoff: the RAG backend currently validates
 * `Authorization: Bearer <jwt>` and does not set HttpOnly cookies.
 * The browser therefore has to keep the token so the API client can
 * attach it. localStorage is used instead of a URL or a global variable.
 *
 * Tradeoffs vs HttpOnly cookies:
 * - Accessible to JavaScript on this origin (XSS would be able to read it).
 * - Survives reloads, which is required for persistent login.
 * - Never put the JWT in a query string, log it, or send it to a third party.
 *
 * Isolate all reads/writes here. Do not call localStorage from UI code.
 * If the backend later supports cookie sessions, replace this module only.
 */

const TOKEN_KEY = "rag.auth.token";
const USER_KEY = "rag.auth.user";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const authStorage = {
  getToken(): string | null {
    if (!canUseStorage()) return null;
    const value = window.localStorage.getItem(TOKEN_KEY);
    return value && value.trim() ? value : null;
  },

  setToken(token: string): void {
    if (!canUseStorage()) return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(TOKEN_KEY);
  },

  getUserJson(): string | null {
    if (!canUseStorage()) return null;
    return window.localStorage.getItem(USER_KEY);
  },

  setUserJson(value: string): void {
    if (!canUseStorage()) return;
    window.localStorage.setItem(USER_KEY, value);
  },

  removeUser(): void {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(USER_KEY);
  },

  clear(): void {
    this.removeToken();
    this.removeUser();
  },
};
