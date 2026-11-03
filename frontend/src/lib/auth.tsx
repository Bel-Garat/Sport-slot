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
  type SignInResponse,
} from "@/lib/api";

/** Kam `RequireRole` posílá nepřihlášené uživatele (s parametrem `?next=<stránka>`). */
export const loginPath = "/login";

const sameSiteBase = "http://same-site.invalid";

/**
 * Bezpečná cesta pro přesměrování po přihlášení: vrátí `next`, jen když vede na náš web,
 * jinak `/`. Na přihlašovací stránce přesměrovávejte vždy přes tuto funkci, nikdy přímo
 * na hodnotu z URL – jinak by šel odkaz `/login?next=//cizi-web.cz` zneužít.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next?.startsWith("/")) {
    return "/";
  }
  try {
    const url = new URL(next, sameSiteBase);
    const path = url.pathname + url.search + url.hash;
    // Prohlížeč z `/.//cizi-web.cz` udělá `//cizi-web.cz`, proto kontrolujeme až výslednou cestu.
    return url.origin === sameSiteBase && !path.startsWith("//") ? path : "/";
  } catch {
    return "/";
  }
}

/**
 * Odhlášení podle auth kontraktu: smaže token a načte úvodní stránku znovu.
 * Backend žádné odhlášení nemá – token prostě přestaneme posílat.
 */
export function logout(): void {
  clearToken();
  window.location.assign("/");
}

type AuthState = {
  /** Přihlášený uživatel, nebo `null`. */
  user: CurrentUser | null;
  /** `true`, dokud se při načtení stránky ověřuje token (`user/me`). */
  loading: boolean;
  /** Po úspěšném `auth/googleCallback`: uloží token a uživatele. */
  signIn: (response: SignInResponse) => void;
};

const AuthContext = createContext<AuthState | null>(null);

/** Drží přihlášeného uživatele pro celou aplikaci. Je zapojený v `app/layout.tsx`. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, "signIn">>({
    user: null,
    loading: true,
  });
  // Když se uživatel přihlásí dřív, než doběhne první `user/me`, výsledek `user/me` už neplatí.
  const signedInMeanwhile = useRef(false);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .catch(() => null)
      .then((user) => {
        if (active && !signedInMeanwhile.current) {
          setState({ user, loading: false });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(({ token, user }: SignInResponse) => {
    setToken(token);
    signedInMeanwhile.current = true;
    setState({ user, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Přihlášený uživatel v libovolné klientské komponentě:
 *   const { user, loading, signIn } = useAuth();
 * Např. avatar v hlavičce: `user?.name`; tlačítko jen pro správce: `user?.roles.includes("MANAGER")`.
 */
export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
