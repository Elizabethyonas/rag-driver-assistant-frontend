import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { parseSession } from "@/lib/api/sessions";
import type { Message, MessageRole, SendMessageRequest, SendMessageResponse } from "@/types/api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asRole(value: unknown): MessageRole {
  if (value === "user" || value === "assistant" || value === "system") {
    return value;
  }
  return "assistant";
}

export function parseMessage(value: unknown): Message {
  if (!isRecord(value) || typeof value.id !== "string") {
    throw new ApiError(500, "server_error", "The server returned an invalid message.");
  }
  return {
    id: value.id,
    session_id: asString(value.session_id),
    role: asRole(value.role),
    content: asString(value.content),
    created_at: asString(value.created_at),
  };
}

export async function listMessages(
  sessionId: string,
  limit = 50,
  signal?: AbortSignal,
): Promise<Message[]> {
  const payload = await apiClient.get<unknown>(`/sessions/${sessionId}/messages`, {
    query: { limit },
    signal,
  });
  if (!Array.isArray(payload)) {
    throw new ApiError(500, "server_error", "The server returned an invalid message list.");
  }
  return payload.map(parseMessage);
}

export async function sendMessage(
  sessionId: string,
  body: SendMessageRequest,
): Promise<SendMessageResponse> {
  const payload = await apiClient.post<unknown>(`/sessions/${sessionId}/messages`, {
    message: body.message,
    car_context: body.car_context ?? "",
    vehicle_id: body.vehicle_id ?? null,
    title: body.title ?? null,
    use_user_manual: body.use_user_manual ?? true,
  });
  if (!isRecord(payload)) {
    throw new ApiError(500, "server_error", "The server returned an invalid send-message response.");
  }
  return {
    session: parseSession(payload.session),
    user_message: parseMessage(payload.user_message),
    assistant_message: parseMessage(payload.assistant_message),
  };
}
