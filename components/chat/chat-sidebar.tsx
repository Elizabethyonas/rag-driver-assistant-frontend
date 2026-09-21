"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { UserMenu } from "@/components/chat/user-menu";
import { useChatSessions } from "@/components/chat/chat-sessions-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CarIcon, MessageIcon, PlusIcon, TrashIcon, XIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime, isPlaceholderTitle } from "@/lib/format";
import { toUserFacingError } from "@/lib/api/errors";

type ChatSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function ChatSidebar({ mobileOpen, onClose }: ChatSidebarProps) {
  const { sessions, isLoading, error, creating, create, remove } = useChatSessions();
  const pathname = usePathname();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onNewChat() {
    try {
      const session = await create({ title: "New chat" });
      onClose();
      router.push(`/chat/${session.id}`);
    } catch {
      // Error is already stored on the sessions context.
    }
  }

  async function onDelete(sessionId: string) {
    setBusyId(sessionId);
    try {
      await remove(sessionId);
      if (pathname === `/chat/${sessionId}`) {
        router.push("/chat");
      }
    } catch (err) {
      window.alert(toUserFacingError(err).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(20rem,88vw)] flex-col border-r border-border bg-surface-2 transition-transform md:static md:z-0 md:w-72 md:translate-x-0 lg:w-80 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        aria-label="Conversations"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <CarIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">Driver Assistant</p>
              <p className="text-xs text-muted">Vehicle help, on demand</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-muted hover:bg-surface-3 md:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3">
          <Button className="w-full" onClick={onNewChat} loading={creating} disabled={creating}>
            <PlusIcon className="h-4 w-4" />
            New chat
          </Button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-2 pb-3">
          <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Recent conversations
          </p>
          {error ? (
            <div className="px-1">
              <Alert>{error}</Alert>
            </div>
          ) : null}
          {isLoading ? (
            <div className="space-y-2 px-1">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : null}
          {!isLoading && sessions.length === 0 && !error ? (
            <p className="px-2 text-sm text-muted">No conversations yet. Start a new chat.</p>
          ) : null}
          <ul className="space-y-1">
            {sessions.map((session) => {
              const href = `/chat/${session.id}`;
              const active = pathname === href;
              const title = isPlaceholderTitle(session.title)
                ? "New conversation"
                : session.title;
              return (
                <li key={session.id}>
                  <div
                    className={`group flex items-center gap-1 rounded-xl ${
                      active ? "bg-surface" : "hover:bg-surface/70"
                    }`}
                  >
                    <Link
                      href={href}
                      onClick={onClose}
                      className="flex min-w-0 flex-1 items-start gap-2 px-2.5 py-2"
                    >
                      <MessageIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{title}</span>
                        <span className="block text-xs text-muted">
                          {formatRelativeTime(session.updated_at || session.created_at)}
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      className="mr-1 rounded-lg p-2 text-muted opacity-100 hover:bg-danger/10 hover:text-danger md:opacity-0 md:group-hover:opacity-100"
                      aria-label={`Delete ${title}`}
                      disabled={busyId === session.id}
                      onClick={() => onDelete(session.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-border p-3">
          <UserMenu />
        </div>
      </aside>
    </>
  );
}
