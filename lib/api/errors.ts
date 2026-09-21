import type { ApiErrorCode } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details: unknown;

  constructor(status: number, code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function codeForStatus(status: number): ApiErrorCode {
  if (status === 400) return "bad_request";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status === 429) return "rate_limited";
  if (status === 503) return "unavailable";
  if (status >= 500) return "server_error";
  return "unknown";
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "The request could not be processed. Please check your input and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have permission to do that.",
  404: "The requested resource was not found.",
  409: "This conflicts with existing data. Please try a different value.",
  422: "Some of the information you entered is invalid.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on the server. Please try again.",
  502: "The server is temporarily unreachable. Please try again.",
  503: "The assistant is temporarily unavailable. Please try again shortly.",
  504: "The server took too long to respond. Please try again.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * FastAPI typically returns `{ "detail": string | validation[] }`.
 * Never surface stack traces, JWT material, or internal exception types.
 */
export function extractApiErrorMessage(payload: unknown, status: number): string {
  if (isRecord(payload)) {
    const detail = payload.detail;
    if (typeof detail === "string" && detail.trim()) {
      const trimmed = detail.trim();
      if (!looksInternal(trimmed)) {
        return friendlyDetail(trimmed, status);
      }
    }
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (isRecord(item) && typeof item.msg === "string") {
            return item.msg;
          }
          return null;
        })
        .filter((msg): msg is string => Boolean(msg));
      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error.trim();
    }
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message.trim();
    }
  }
  return STATUS_MESSAGES[status] ?? "Something went wrong. Please try again.";
}

function looksInternal(message: string): boolean {
  return (
    /traceback|sqlalchemy|psycopg|jwt_secret|stack trace|internal server error/i.test(
      message,
    ) || message.length > 280
  );
}

function friendlyDetail(detail: string, status: number): string {
  const lower = detail.toLowerCase();
  if (lower.includes("email already")) {
    return "That email is already registered. Try logging in instead.";
  }
  if (
    lower.includes("invalid credentials") ||
    lower.includes("invalid email or password") ||
    lower.includes("incorrect password")
  ) {
    return "Invalid email or password.";
  }
  if (lower.includes("not found") && (lower.includes("user") || lower.includes("account"))) {
    return "No account was found with that email.";
  }
  if (status === 401 && (lower.includes("token") || lower.includes("authorization") || lower.includes("expired"))) {
    return STATUS_MESSAGES[401];
  }
  return detail;
}

export function errorFromStatus(status: number, payload: unknown): ApiError {
  return new ApiError(status, codeForStatus(status), extractApiErrorMessage(payload, status), payload);
}

export function networkError(): ApiError {
  return new ApiError(
    0,
    "network",
    "Unable to reach the server. Check your connection and that NEXT_PUBLIC_API_URL is correct.",
  );
}

export function toUserFacingError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }
  if (error instanceof Error && error.name === "AbortError") {
    return new ApiError(0, "unknown", "Request was cancelled.");
  }
  return networkError();
}
