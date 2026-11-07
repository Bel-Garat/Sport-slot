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

export function loginHref(returnTo?: string): string {
  if (!returnTo || returnTo === "/" || returnTo.startsWith(loginPath)) {
    return loginPath;
  }
  return `${loginPath}?next=${encodeURIComponent(returnTo)}`;
}

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
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Pick<AuthState, "user" | "loading">>({
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

  const signIn = useCallback(
    ({ token, user }: GoogleSignIn) => {
      setToken(token);
      setUser(user);
    },
    [setUser],
  );

  return (
    <AuthContext.Provider value={{ ...state, setUser, signIn }}>
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
