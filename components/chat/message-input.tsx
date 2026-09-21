"use client";

import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon } from "@/components/ui/icons";

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled,
  sending,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  sending: boolean;
}) {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !disabled && !sending;

  function resize() {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  useEffect(() => {
    resize();
  }, [value]);

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onSend();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-background/80 px-3 py-3 backdrop-blur sm:px-5"
    >
      <label htmlFor="chat-message" className="sr-only">
        Message
      </label>
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-sm">
        <textarea
          id="chat-message"
          ref={areaRef}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder="Ask about your vehicle..."
          onChange={(event) => {
            onChange(event.target.value);
            requestAnimationFrame(resize);
          }}
          onKeyDown={onKeyDown}
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted"
        />
        <Button
          type="submit"
          className="shrink-0 px-3"
          disabled={!canSend}
          loading={sending}
          aria-label="Send message"
        >
          {sending ? null : <SendIcon className="h-4 w-4" />}
          <span className="hidden sm:inline">{sending ? "Thinking..." : "Send"}</span>
        </Button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl px-1 text-xs text-muted">
        Enter to send · Shift + Enter for a new line
      </p>
    </form>
  );
}
