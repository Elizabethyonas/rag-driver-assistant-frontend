import { decodeJwtPayload } from "@/lib/auth/jwt";
import { authStorage } from "@/lib/auth/storage";
import type { User } from "@/types/api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function persistAuth(token: string, user?: User): User {
  authStorage.setToken(token);
  const resolved = user ?? userFromStoredToken(token) ?? {
    id: "unknown",
    email: "",
  };
  authStorage.setUserJson(JSON.stringify(resolved));
  return resolved;
}

export function readStoredUser(): User | null {
  const raw = authStorage.getUserJson();
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed.id !== "string") {
      return null;
    }
    return {
      id: parsed.id,
      email: typeof parsed.email === "string" ? parsed.email : "",
      name: typeof parsed.name === "string" ? parsed.name : undefined,
    };
  } catch {
    return null;
  }
}

export function userFromStoredToken(token: string): User | undefined {
  const payload = decodeJwtPayload(token);
  if (!payload) return undefined;
  const id =
    (typeof payload.sub === "string" && payload.sub) ||
    (typeof payload.id === "string" && payload.id) ||
    "";
  if (!id) return undefined;
  return {
    id,
    email: typeof payload.email === "string" ? payload.email : "",
    name: typeof payload.name === "string" ? payload.name : undefined,
  };
}

export function clearAuth(): void {
  authStorage.clear();
}
