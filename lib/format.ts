export function deriveSessionTitle(message: string): string {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (!cleaned) return "New conversation";
  if (cleaned.length <= 48) return cleaned;
  return `${cleaned.slice(0, 45).trimEnd()}...`;
}

export function isPlaceholderTitle(title: string | undefined): boolean {
  const value = (title ?? "").trim().toLowerCase();
  return value === "" || value === "new chat" || value === "new conversation";
}

export function formatRelativeTime(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 45) return "Just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function displayName(name: string | undefined, email: string): string {
  if (name && name.trim()) return name.trim();
  if (email) return email.split("@")[0] ?? email;
  return "Driver";
}

export function initials(name: string | undefined, email: string): string {
  const source = (name && name.trim()) || email || "D";
  const parts = source.split(/[\s@]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "D";
}
