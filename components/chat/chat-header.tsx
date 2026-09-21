"use client";

import { useChatSessions } from "@/components/chat/chat-sessions-context";
import { MenuIcon } from "@/components/ui/icons";
import { isPlaceholderTitle } from "@/lib/format";

export function ChatHeader({
  sessionId,
  onOpenSidebar,
}: {
  sessionId: string | null;
  onOpenSidebar: () => void;
}) {
  const { sessions } = useChatSessions();
  const session = sessions.find((item) => item.id === sessionId);
  const title = session
    ? isPlaceholderTitle(session.title)
      ? "New conversation"
      : session.title
    : "Driver Assistant";

  return (
    <header className="flex items-center gap-3 border-b border-border px-3 py-3 sm:px-5">
      <button
        type="button"
        className="rounded-lg p-2 text-foreground hover:bg-surface-2 md:hidden"
        onClick={onOpenSidebar}
        aria-label="Open conversations"
      >
        <MenuIcon className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
        <p className="text-xs text-muted">Ask about maintenance, warning lights, and driving issues</p>
      </div>
    </header>
  );
}
