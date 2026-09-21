const FALLBACK_MESSAGE =
  "NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local and point it at your FastAPI backend.";

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    throw new Error(FALLBACK_MESSAGE);
  }
  return raw.replace(/\/+$/, "");
}
