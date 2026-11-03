"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getCurrentUser, type CurrentUser } from "@/lib/api";

export const loginPath = "/login";

const sameSiteBase = "http://same-site.invalid";

export function safeNextPath(next: string | null | undefined): string {
  if (!next?.startsWith("/")) {
    return "/";
  }
  try {
    const url = new URL(next, sameSiteBase);
    const path = url.pathname + url.search + url.hash;
    return url.origin === sameSiteBase && !path.startsWith("//") ? path : "/";
  } catch {
    return "/";
  }
}

type AuthState = {
  user: CurrentUser | null;
  loading: boolean;
  setUser: (user: CurrentUser | null) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, "setUser">>({
    user: null,
    loading: true,
  });
  const userSetManually = useRef(false);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .catch(() => null)
      .then((user) => {
        if (active && !userSetManually.current) {
          setState({ user, loading: false });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const setUser = useCallback((user: CurrentUser | null) => {
    userSetManually.current = true;
    setState({ user, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
