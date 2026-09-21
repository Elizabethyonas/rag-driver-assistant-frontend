"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FullPageSpinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth/auth-context";
import type { ReactNode } from "react";

function safeNextPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/login") || value.startsWith("/signup")) return null;
  return value;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    const search = searchParams.toString();
    const from = `${pathname}${search ? `?${search}` : ""}`;
    const params = new URLSearchParams();
    if (from && from !== "/login") {
      params.set("from", from);
    }
    const suffix = params.toString();
    router.replace(suffix ? `/login?${suffix}` : "/login");
  }, [isAuthenticated, isLoading, pathname, router, searchParams]);

  if (isLoading) {
    return <FullPageSpinner label="Restoring your session..." />;
  }

  if (!isAuthenticated) {
    return <FullPageSpinner label="Redirecting to login..." />;
  }

  return children;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    router.replace(safeNextPath(searchParams.get("from")) ?? "/chat");
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (isAuthenticated) {
    return <FullPageSpinner label="Taking you to chat..." />;
  }

  return children;
}
