"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowClockwise,
  ArrowRight,
  CircleNotch,
  Info,
  LockSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import { ApiError, signInWithGoogle } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type GoogleCredentialResponse = { credential: string };

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: Record<string, string | number>,
      ) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const scriptTimeoutMs = 10000;

export function SignInPanelSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <div className="h-11 w-full animate-pulse rounded-full bg-surface" />
      <div className="h-px bg-line" />
      <div className="h-11 w-full animate-pulse rounded-full bg-surface" />
    </div>
  );
}

export function SignInPanel({
  reason,
  onSignedIn,
  onBrowse,
}: {
  reason?: string | null;
  onSignedIn?: () => void;
  onBrowse?: () => void;
}) {
  const { signIn } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);
  const [scriptState, setScriptState] = useState<"loading" | "ready" | "failed">("loading");
  const [buttonRendered, setButtonRendered] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.google) setScriptState("ready");
  }, []);

  useEffect(() => {
    if (scriptState !== "loading") return;
    const timer = window.setTimeout(() => setScriptState("failed"), scriptTimeoutMs);
    return () => window.clearTimeout(timer);
  }, [scriptState]);

  const handleCredential = useCallback(
    async ({ credential }: GoogleCredentialResponse) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setPending(true);
      setError(null);
      try {
        signIn(await signInWithGoogle(credential));
        onSignedIn?.();
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Server se nepodařilo kontaktovat. Pokud byl delší dobu nečinný, probouzí se – zkuste to za chvíli znovu.",
        );
      } finally {
        pendingRef.current = false;
        setPending(false);
      }
    },
    [signIn, onSignedIn],
  );

  useEffect(() => {
    const container = buttonRef.current;
    if (scriptState !== "ready" || !googleClientId || !container || !window.google) {
      return;
    }
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredential,
    });
    let lastWidth = 0;
    const render = () => {
      const width = Math.floor(Math.min(container.clientWidth, 400));
      // A dialog can still be hidden when the SDK becomes ready.
      if (width === 0 || width === lastWidth) return;
      lastWidth = width;
      container.replaceChildren();
      window.google?.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        logo_alignment: "left",
        locale: "cs",
        width,
      });
      setButtonRendered(true);
    };
    render();
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => observer.disconnect();
  }, [scriptState, handleCredential]);

  return (
    <div className="grid gap-5">
      {reason && (
        <p className="flex gap-3 rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground">
          <Info size={18} className="mt-0.5 shrink-0 text-brand-500" aria-hidden="true" />
          <span>{reason}</span>
        </p>
      )}

      {!googleClientId ? (
        <div role="status" className="flex gap-3 rounded-xl border border-line bg-surface/60 p-4 text-sm">
          <Info size={20} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
          <div>
            <p className="font-semibold">Přihlášení je dočasně nedostupné</p>
            <p className="mt-1 leading-relaxed text-muted">Zkuste to prosím později. Sportoviště si můžete prohlédnout i bez účtu.</p>
          </div>
        </div>
      ) : (
        <div>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onReady={() => setScriptState("ready")}
            onError={() => setScriptState("failed")}
          />
          <div className={scriptState === "failed" && !buttonRendered ? "hidden" : "relative min-h-11"}>
            <div
              ref={buttonRef}
              aria-busy={pending}
              inert={pending}
              className={`flex min-h-11 w-full items-center justify-center ${pending ? "pointer-events-none opacity-40" : ""}`}
            />
            {!buttonRendered && scriptState === "loading" && (
              <div role="status" className="absolute inset-0 flex h-11 items-center justify-center gap-2 rounded border border-line bg-surface text-sm text-muted">
                <CircleNotch size={18} className="animate-spin" aria-hidden="true" /> Načítání přihlášení…
              </div>
            )}
          </div>

          {scriptState === "failed" && !buttonRendered && (
            <div role="alert" className="grid gap-3 text-sm">
              <p className="flex gap-3 text-foreground">
                <WarningCircle size={20} className="mt-0.5 shrink-0 text-red-700 dark:text-red-400" aria-hidden="true" />
                <span>
                  Přihlašovací tlačítko Google se nenačetlo. Zkontrolujte připojení nebo
                  blokování obsahu v prohlížeči.
                </span>
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="button button-outline w-full gap-2"
              >
                Zkusit znovu <ArrowClockwise size={18} aria-hidden="true" />
              </button>
            </div>
          )}

          {pending && (
            <p role="status" className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <CircleNotch size={18} className="animate-spin" aria-hidden="true" />
              Přihlašujeme vás…
            </p>
          )}

          {error && (
            <p role="alert" className="mt-4 flex gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:bg-red-950/40 dark:text-red-300">
              <WarningCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
          {buttonRendered && !pending && !error && <p className="mt-3 text-center text-xs leading-relaxed text-muted">Jste tu poprvé? Účet vám rovnou vytvoříme.</p>}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs font-medium tracking-[.08em] text-muted uppercase">
        <span className="h-px flex-1 bg-line" />
        nebo
        <span className="h-px flex-1 bg-line" />
      </div>

      {onBrowse ? (
        <button type="button" onClick={onBrowse} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors hover:bg-surface">
          Pokračovat bez přihlášení <ArrowRight size={16} aria-hidden="true" />
        </button>
      ) : (
        <Link href="/venues" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors hover:bg-surface">
          Prohlédnout sportoviště <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
        <LockSimple size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        Z účtu Google použijeme jen vaše jméno a e-mail. Vaše heslo nikdy nevidíme a nic za vás nezveřejníme.
      </p>
    </div>
  );
}
