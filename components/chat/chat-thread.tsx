"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyChat } from "@/components/chat/empty-chat";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList, type ThreadMessage } from "@/components/chat/message-list";
import { useChatSessions } from "@/components/chat/chat-sessions-context";
import { Alert } from "@/components/ui/alert";
import { listMessages, sendMessage } from "@/lib/api/messages";
import { toUserFacingError } from "@/lib/api/errors";
import { deriveSessionTitle, isPlaceholderTitle } from "@/lib/format";
import type { Message } from "@/types/api";

const primedThreads = new Map<string, ThreadMessage[]>();

function toThread(messages: Message[]): ThreadMessage[] {
  return messages.map((message) => ({ ...message, status: "complete" as const }));
}

export function ChatThread() {
  const params = useParams<{ sessionId?: string }>();
  const sessionId = typeof params.sessionId === "string" ? params.sessionId : null;
  return <ChatThreadSession key={sessionId ?? "new"} sessionId={sessionId} />;
}

function ChatThreadSession({ sessionId }: { sessionId: string | null }) {
  const router = useRouter();
  const { sessions, create, upsert } = useChatSessions();
  const primed = sessionId ? primedThreads.get(sessionId) : undefined;
  const skipFetch = useRef(Boolean(primed));
  const [messages, setMessages] = useState<ThreadMessage[]>(primed ?? []);
  const [loading, setLoading] = useState(Boolean(sessionId) && !primed);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    if (skipFetch.current) {
      skipFetch.current = false;
      primedThreads.delete(sessionId);
      return;
    }

    const controller = new AbortController();
    listMessages(sessionId, 50, controller.signal)
      .then((rows) => {
        setMessages(toThread(rows));
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof Error && err.name === "AbortError") return;
        setError(toUserFacingError(err).message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [sessionId]);

  const submit = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sending) return;

      const clientId = `local-${Date.now()}`;
      const optimistic: ThreadMessage = {
        id: clientId,
        clientId,
        session_id: sessionId ?? "",
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
        status: "complete",
      };
      const thinking: ThreadMessage = {
        id: `${clientId}-thinking`,
        clientId: `${clientId}-thinking`,
        session_id: sessionId ?? "",
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        status: "thinking",
      };

      setDraft("");
      setSending(true);
      setError(null);
      setMessages((current) => [...current, optimistic, thinking]);

      try {
        let activeSessionId = sessionId;
        const currentSession = sessions.find((item) => item.id === sessionId);
        const title =
          !sessionId || isPlaceholderTitle(currentSession?.title)
            ? deriveSessionTitle(text)
            : undefined;

        if (!activeSessionId) {
          const created = await create({ title: title ?? "New chat" });
          activeSessionId = created.id;
        }

        const response = await sendMessage(activeSessionId, {
          message: text,
          title: title ?? null,
        });
        upsert(response.session);
        const nextMessages: ThreadMessage[] = [
          ...messages.filter((item) => item.status !== "thinking" && item.clientId !== clientId),
          { ...response.user_message, status: "complete" },
          { ...response.assistant_message, status: "complete" },
        ];
        setMessages(nextMessages);
        if (!sessionId) {
          primedThreads.set(activeSessionId, nextMessages);
          router.replace(`/chat/${activeSessionId}`);
        }
      } catch (err) {
        setError(toUserFacingError(err).message);
        setMessages((current) =>
          current
            .filter((item) => item.clientId !== `${clientId}-thinking`)
            .map((item) =>
              item.clientId === clientId ? { ...item, status: "failed" as const } : item,
            ),
        );
      } finally {
        setSending(false);
      }
    },
    [create, messages, router, sending, sessionId, sessions, upsert],
  );

  function onRetry(message: ThreadMessage) {
    setMessages((current) =>
      current.filter((item) => item.id !== message.id && item.clientId !== message.clientId),
    );
    void submit(message.content);
  }

  const showEmpty = !loading && messages.length === 0 && !sending && !error;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {error ? (
          <div className="px-4 pt-4 sm:px-6">
            <Alert>{error}</Alert>
          </div>
        ) : null}
        {showEmpty ? (
          <EmptyChat
            onSelectPrompt={(prompt) => {
              setDraft(prompt);
            }}
          />
        ) : (
          <MessageList messages={messages} loading={loading} onRetry={onRetry} />
        )}
      </div>
      <MessageInput
        value={draft}
        onChange={setDraft}
        onSend={() => void submit(draft)}
        sending={sending}
      />
    </div>
  );
}
