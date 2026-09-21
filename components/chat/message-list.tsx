"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "@/types/api";

export type ThreadMessage = Message & {
  status?: "complete" | "failed" | "thinking";
  clientId?: string;
};

export function MessageList({
  messages,
  loading,
  onRetry,
}: {
  messages: ThreadMessage[];
  loading: boolean;
  onRetry: (message: ThreadMessage) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6 sm:px-6">
        <Skeleton className="ml-auto h-16 w-2/3" />
        <Skeleton className="h-24 w-3/4" />
        <Skeleton className="ml-auto h-12 w-1/2" />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6 sm:px-6">
      {messages.map((message) => (
        <MessageBubble
          key={message.clientId ?? message.id}
          role={message.role}
          content={message.content}
          status={message.status}
          onRetry={message.status === "failed" ? () => onRetry(message) : undefined}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
