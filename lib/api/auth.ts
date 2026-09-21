import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { decodeJwtPayload } from "@/lib/auth/jwt";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types/api";

/**
 * Expected FastAPI auth contract (not present on the current RAG server.py):
 *   POST /auth/register
 *   POST /auth/login
 *
 * The current RAG API validates JWTs on chat routes but does not issue them.
 * These helpers talk to those paths when they exist, and map 404 to a clear error.
 */

const AUTH_MISSING_LOGIN =
  "Frontend auth UI is ready, but the backend currently needs registration/login endpoints that issue JWTs. Expected POST /auth/login on the FastAPI API.";

const AUTH_MISSING_REGISTER =
  "Frontend auth UI is ready, but the backend currently needs registration/login endpoints that issue JWTs. Expected POST /auth/register on the FastAPI API.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asUser(value: unknown): User | undefined {
  if (!isRecord(value)) return undefined;
  const id = asString(value.id) ?? asString(value.user_id) ?? asString(value.sub);
  const email = asString(value.email) ?? "";
  if (!id) return undefined;
  const first = asString(value.firstName) ?? asString(value.first_name);
  const last = asString(value.lastName) ?? asString(value.last_name);
  const combined = [first, last].filter(Boolean).join(" ").trim();
  const name = asString(value.name) ?? (combined || undefined);
  return { id, email, name };
}

function userFromJwt(token: string): User | undefined {
  const payload = decodeJwtPayload(token);
  if (!payload) return undefined;
  const id = asString(payload.sub) ?? asString(payload.id);
  if (!id) return undefined;
  const email = asString(payload.email) ?? "";
  const name = asString(payload.name) ?? asString(payload.given_name);
  return { id, email, name };
}

export function normalizeAuthResponse(payload: unknown): AuthResponse {
  if (!isRecord(payload)) {
    throw new ApiError(500, "server_error", "The server returned an unexpected login response.");
  }

  const token =
    asString(payload.access_token) ?? asString(payload.accessToken) ?? asString(payload.token);

  if (!token) {
    throw new ApiError(
      500,
      "server_error",
      "The server did not return an access token. Login must issue a JWT.",
    );
  }

  const tokenType = asString(payload.token_type) ?? asString(payload.tokenType) ?? "bearer";
  const user = asUser(payload.user) ?? asUser(payload.driver) ?? userFromJwt(token);

  return {
    access_token: token,
    token_type: tokenType,
    user,
  };
}

function mapAuthEndpointError(error: unknown, missingMessage: string): never {
  if (error instanceof ApiError && error.status === 404) {
    throw new ApiError(404, "not_found", missingMessage, error.details);
  }
  throw error;
}

export async function loginRequest(input: LoginRequest): Promise<AuthResponse> {
  try {
    const payload = await apiClient.post<unknown>("/auth/login", input, {
      auth: false,
      handleUnauthorized: false,
    });
    return normalizeAuthResponse(payload);
  } catch (error) {
    mapAuthEndpointError(error, AUTH_MISSING_LOGIN);
  }
}

export async function registerRequest(input: RegisterRequest): Promise<AuthResponse> {
  try {
    const payload = await apiClient.post<unknown>("/auth/register", input, {
      auth: false,
      handleUnauthorized: false,
    });
    return normalizeAuthResponse(payload);
  } catch (error) {
    mapAuthEndpointError(error, AUTH_MISSING_REGISTER);
  }
}

/**
 * Optional current-user endpoint. The RAG backend does not expose this yet.
 * Returns null on 404 so restore can fall back to the stored user / JWT claims.
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const payload = await apiClient.get<unknown>("/auth/me", { handleUnauthorized: false });
    return asUser(payload) ?? null;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      return null;
    }
    throw error;
  }
}
