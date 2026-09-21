"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOutIcon } from "@/components/ui/icons";
import { displayName, initials } from "@/lib/format";
import { useAuth } from "@/lib/auth/auth-context";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const name = displayName(user?.name, user?.email ?? "");
  const email = user?.email || "Signed in";

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function onLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-left hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
          {initials(user?.name, user?.email ?? "")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{name}</span>
          <span className="block truncate text-xs text-muted">{email}</span>
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          <Link
            href="/chat"
            role="menuitem"
            className="block px-3 py-2 text-sm hover:bg-surface-2"
            onClick={() => setOpen(false)}
          >
            Conversations
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger/8"
            onClick={onLogout}
          >
            <LogOutIcon className="h-4 w-4" />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
