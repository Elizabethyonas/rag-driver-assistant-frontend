"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSession, deleteSession, listSessions } from "@/lib/api/sessions";
import { toUserFacingError } from "@/lib/api/errors";
import type { CreateSessionRequest, Session } from "@/types/api";

type ChatSessionsContextValue = {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  creating: boolean;
  refresh: () => Promise<void>;
  create: (body?: CreateSessionRequest) => Promise<Session>;
  remove: (sessionId: string) => Promise<void>;
  upsert: (session: Session) => void;
};

const ChatSessionsContext = createContext<ChatSessionsContextValue | null>(null);

export function ChatSessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const rows = await listSessions();
    setSessions(rows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    listSessions()
      .then((rows) => {
        if (!cancelled) setSessions(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(toUserFacingError(err).message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const create = useCallback(async (body?: CreateSessionRequest) => {
    setCreating(true);
    setError(null);
    try {
      const session = await createSession(body);
      setSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
      return session;
    } catch (err) {
      setError(toUserFacingError(err).message);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  const remove = useCallback(async (sessionId: string) => {
    await deleteSession(sessionId);
    setSessions((current) => current.filter((item) => item.id !== sessionId));
  }, []);

  const upsert = useCallback((session: Session) => {
    setSessions((current) => {
      const rest = current.filter((item) => item.id !== session.id);
      return [session, ...rest];
    });
  }, []);

  const value = useMemo(
    () => ({
      sessions,
      isLoading,
      error,
      creating,
      refresh,
      create,
      remove,
      upsert,
    }),
    [sessions, isLoading, error, creating, refresh, create, remove, upsert],
  );

  return <ChatSessionsContext.Provider value={value}>{children}</ChatSessionsContext.Provider>;
}

export function useChatSessions(): ChatSessionsContextValue {
  const context = useContext(ChatSessionsContext);
  if (!context) {
    throw new Error("useChatSessions must be used within ChatSessionsProvider.");
  }
  return context;
}
