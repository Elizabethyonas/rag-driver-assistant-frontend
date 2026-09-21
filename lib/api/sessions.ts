import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { CreateSessionRequest, Session } from "@/types/api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function parseSession(value: unknown): Session {
  if (!isRecord(value) || typeof value.id !== "string") {
    throw new ApiError(500, "server_error", "The server returned an invalid session.");
  }
  return {
    id: value.id,
    user_id: asString(value.user_id),
    title: asString(value.title) || "New conversation",
    car_context: asString(value.car_context),
    vehicle_id: typeof value.vehicle_id === "string" ? value.vehicle_id : null,
    created_at: asString(value.created_at),
    updated_at: asString(value.updated_at),
  };
}

export async function listSessions(signal?: AbortSignal): Promise<Session[]> {
  const payload = await apiClient.get<unknown>("/sessions", { signal });
  if (!Array.isArray(payload)) {
    throw new ApiError(500, "server_error", "The server returned an invalid session list.");
  }
  return payload.map(parseSession);
}

export async function createSession(body: CreateSessionRequest = {}): Promise<Session> {
  const payload = await apiClient.post<unknown>("/sessions", {
    title: body.title?.trim() || "New chat",
    vehicle_id: body.vehicle_id ?? null,
    car_context: body.car_context ?? "",
  });
  return parseSession(payload);
}

export async function getSession(sessionId: string, signal?: AbortSignal): Promise<Session> {
  const payload = await apiClient.get<unknown>(`/sessions/${sessionId}`, { signal });
  return parseSession(payload);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/sessions/${sessionId}`);
}
