"use client";

import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatSessionsProvider } from "@/components/chat/chat-sessions-context";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatThread } from "@/components/chat/chat-thread";

function ChatFrame() {
  const params = useParams<{ sessionId?: string }>();
  const sessionId = typeof params.sessionId === "string" ? params.sessionId : null;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full min-h-full flex-1 overflow-hidden bg-background">
      <ChatSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader sessionId={sessionId} onOpenSidebar={() => setMobileOpen(true)} />
        <ChatThread />
      </div>
    </div>
  );
}

export function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <ChatSessionsProvider>
      <div className="flex min-h-full flex-1 flex-col">
        <ChatFrame />
        {children}
      </div>
    </ChatSessionsProvider>
  );
}
