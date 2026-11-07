"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  clearToken,
  getCurrentUser,
  setToken,
  type CurrentUser,
  type GoogleSignIn,
  type Role,
} from "@/lib/api";

export const loginPath = "/login";

export const roleLabels: Record<Role, string> = {
  PLAYER: "Hráč",
  MANAGER: "Správce",
  ADMIN: "Administrátor",
};

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toLocaleUpperCase("cs");
}

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
  signIn: (signIn: GoogleSignIn) => void;
  loginOpen: boolean;
  loginReason: string | null;
  openLogin: (reason?: string) => void;
  closeLogin: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Pick<AuthState, "user" | "loading">>({
    user: null,
    loading: true,
  });
  const userSetManually = useRef(false);
  const [login, setLogin] = useState<{ open: boolean; reason: string | null }>({
    open: false,
    reason: null,
  });

  const openLogin = useCallback((reason?: string) => {
    setLogin({ open: true, reason: reason ?? null });
  }, []);

  const closeLogin = useCallback(() => {
    setLogin((current) => ({ ...current, open: false }));
  }, []);

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

  const signIn = useCallback(
    ({ token, user }: GoogleSignIn) => {
      setToken(token);
      setUser(user);
    },
    [setUser],
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setUser,
        signIn,
        loginOpen: login.open,
        loginReason: login.reason,
        openLogin,
        closeLogin,
      }}
    >
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

export function logout(): void {
  clearToken();
  window.location.assign("/");
}
