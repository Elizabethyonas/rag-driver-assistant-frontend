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
import { loginRequest, registerRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { isJwtExpired } from "@/lib/auth/jwt";
import { clearAuth, persistAuth, readStoredUser, userFromStoredToken } from "@/lib/auth/persist";
import { onUnauthorized } from "@/lib/auth/session-events";
import { authStorage } from "@/lib/auth/storage";
import type { LoginRequest, RegisterRequest, User } from "@/types/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginRequest) => Promise<void>;
  signup: (input: RegisterRequest) => Promise<void>;
  logout: () => void;
};

type SessionState = {
  token: string | null;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): SessionState {
  const storedToken = authStorage.getToken();
  if (!storedToken || isJwtExpired(storedToken)) {
    return { token: null, user: null };
  }
  return {
    token: storedToken,
    user: readStoredUser() ?? userFromStoredToken(storedToken) ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({ token: null, user: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore bearer-token session from isolated authStorage after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is not available during SSR
    setSession(readStoredSession());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return onUnauthorized(() => {
      setSession({ token: null, user: null });
    });
  }, []);

  const applySession = useCallback((nextToken: string, nextUser?: User) => {
    const storedUser = persistAuth(nextToken, nextUser);
    setSession({ token: nextToken, user: storedUser });
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setSession({ token: null, user: null });
  }, []);

  const login = useCallback(
    async (input: LoginRequest) => {
      const response = await loginRequest(input);
      applySession(response.access_token, response.user);
    },
    [applySession],
  );

  const signup = useCallback(
    async (input: RegisterRequest) => {
      const response = await registerRequest(input);
      if (!response.access_token) {
        throw new ApiError(
          400,
          "bad_request",
          "Account created, but the server did not return a token. Please log in.",
        );
      }
      applySession(response.access_token, response.user);
    },
    [applySession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session.user,
      token: session.token,
      isAuthenticated: Boolean(session.token),
      isLoading,
      login,
      signup,
      logout,
    }),
    [session.user, session.token, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
