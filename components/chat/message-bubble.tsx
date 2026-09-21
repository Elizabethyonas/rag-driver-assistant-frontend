"use client";

import { RefreshIcon } from "@/components/ui/icons";

type MessageBubbleProps = {
  role: "user" | "assistant" | "system";
  content: string;
  status?: "complete" | "failed" | "thinking";
  onRetry?: () => void;
};

export function MessageBubble({ role, content, status = "complete", onRetry }: MessageBubbleProps) {
  const isUser = role === "user";

  if (status === "thinking") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3 text-sm">
          <p className="text-muted">Assistant is thinking...</p>
          <span className="mt-2 flex gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "rounded-tr-md bg-accent text-accent-foreground"
            : "rounded-tl-md border border-border bg-surface"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        {status === "failed" ? (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className={isUser ? "text-accent-foreground/80" : "text-danger"}>
              Couldn&apos;t send this message.
            </span>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium ${
                  isUser ? "bg-black/10 hover:bg-black/15" : "bg-danger/10 text-danger hover:bg-danger/15"
                }`}
              >
                <RefreshIcon className="h-3.5 w-3.5" />
                Retry
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
