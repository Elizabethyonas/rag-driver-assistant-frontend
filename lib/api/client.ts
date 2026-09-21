import { getApiBaseUrl } from "@/lib/config";
import { emitUnauthorized } from "@/lib/auth/session-events";
import { isJwtExpired } from "@/lib/auth/jwt";
import { authStorage } from "@/lib/auth/storage";
import { ApiError, errorFromStatus, networkError } from "@/lib/api/errors";

export type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Attach the stored JWT. Default true. Set false for login/register. */
  auth?: boolean;
  signal?: AbortSignal;
  /**
   * When true (default), HTTP 401 clears local auth and notifies the app.
   * Always false for login/register so a bad password is not treated as expiry.
   */
  handleUnauthorized?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalized}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    query,
    auth = true,
    signal,
    handleUnauthorized = true,
  } = options;

  const headers = new Headers();
  const init: RequestInit = {
    method,
    headers,
    signal,
    credentials: "omit",
  };

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    init.body = JSON.stringify(body);
  }

  if (auth) {
    const token = authStorage.getToken();
    if (token && isJwtExpired(token)) {
      authStorage.clear();
      emitUnauthorized();
    } else if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw networkError();
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401 && handleUnauthorized && auth) {
      authStorage.clear();
      emitUnauthorized();
    }
    throw errorFromStatus(response.status, payload);
  }

  return payload as T;
}

export const apiClient = {
  get<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...options, method: "POST", body });
  },

  delete<T = void>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};

export function readErrorPayload(error: unknown): unknown {
  if (error instanceof ApiError) {
    return error.details;
  }
  if (isRecord(error)) {
    return error;
  }
  return undefined;
}
