"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowClockwise,
  ArrowRight,
  CalendarCheck,
  CircleNotch,
  Info,
  ShieldCheck,
  Storefront,
  WarningCircle,
} from "@phosphor-icons/react";
import { ApiError, signInWithGoogle } from "@/lib/api";
import { safeNextPath, useAuth } from "@/lib/auth";

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

const benefits = [
  { icon: CalendarCheck, text: "Najdete sportoviště a jeho volné kurty na jednom místě." },
  { icon: Storefront, text: "Správci tu zakládají svá sportoviště a kurty." },
  { icon: ShieldCheck, text: "Žádné nové heslo – přihlášení obstará Google." },
];

function destinationLabel(nextPath: string): string | null {
  if (nextPath === "/") return null;
  if (nextPath.startsWith("/venues/new")) return "založení sportoviště";
  if (/^\/venues\/[^/]+\/courts\/new/.test(nextPath)) return "přidání kurtu";
  return "stránku, kterou jste chtěli otevřít";
}

export function GoogleSignInSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-3xl border border-line bg-surface/60 p-6">
      <div className="h-11 w-full max-w-[320px] animate-pulse rounded-full bg-line/70" />
      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-line/60" />
    </div>
  );
}

export function GoogleSignIn() {
  const router = useRouter();
  const nextPath = safeNextPath(useSearchParams().get("next"));
  const destination = destinationLabel(nextPath);
  const { user, loading, signIn } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptState, setScriptState] = useState<"loading" | "ready" | "failed">("loading");
  const [buttonRendered, setButtonRendered] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [loading, user, nextPath, router]);

  useEffect(() => {
    if (scriptState !== "loading") return;
    const timer = window.setTimeout(() => setScriptState("failed"), scriptTimeoutMs);
    return () => window.clearTimeout(timer);
  }, [scriptState]);

  const handleCredential = useCallback(
    async ({ credential }: GoogleCredentialResponse) => {
      setPending(true);
      setError(null);
      try {
        signIn(await signInWithGoogle(credential));
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Server se nepodařilo kontaktovat. Zkuste to prosím za chvíli znovu.",
        );
        setPending(false);
      }
    },
    [signIn],
  );

  useEffect(() => {
    const container = buttonRef.current;
    if (scriptState !== "ready" || !googleClientId || !container || !window.google) {
      return;
    }
    const width = Math.round(Math.min(Math.max(container.clientWidth, 220), 400));
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredential,
    });
    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "outline" : "filled_black",
      size: "large",
      shape: "pill",
      text: "continue_with",
      logo_alignment: "left",
      locale: "cs",
      width,
    });
    setButtonRendered(true);
  }, [scriptState, handleCredential]);

  if (!loading && user) {
    return (
      <p className="flex items-center gap-2 text-muted" role="status">
        <CircleNotch size={18} className="animate-spin" aria-hidden="true" />
        Už jste přihlášen jako {user.name}, přesměrováváme…
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      {destination && (
        <p className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm text-foreground">
          <Info size={20} className="mt-0.5 shrink-0 text-brand-500" aria-hidden="true" />
          <span>
            Pro {destination} se musíte přihlásit. Hned potom vás vrátíme zpátky.
          </span>
        </p>
      )}

      <div className="rounded-3xl border border-line bg-surface/60 p-6">
        {!googleClientId ? (
          <p role="alert" className="flex gap-3 text-sm text-foreground">
            <WarningCircle size={20} className="mt-0.5 shrink-0 text-red-700 dark:text-red-400" aria-hidden="true" />
            <span>
              Přihlášení přes Google teď není dostupné – chybí nastavení
              <code className="mx-1 rounded bg-page px-1.5 py-0.5 text-xs">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>.
            </span>
          </p>
        ) : (
          <>
            <Script
              src="https://accounts.google.com/gsi/client"
              strategy="afterInteractive"
              onReady={() => setScriptState("ready")}
              onError={() => setScriptState("failed")}
            />
            <div className="relative min-h-11 max-w-[400px]">
              <div
                ref={buttonRef}
                aria-busy={pending}
                className={pending ? "pointer-events-none opacity-40" : undefined}
              />
              {!buttonRendered && scriptState === "loading" && (
                <div aria-hidden="true" className="absolute inset-0 h-11 animate-pulse rounded-full bg-line/70" />
              )}
            </div>

            {scriptState === "failed" && !buttonRendered && (
              <div role="alert" className="mt-1 grid gap-3 text-sm">
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
                  className="button button-outline w-fit"
                >
                  Zkusit znovu <ArrowClockwise size={18} aria-hidden="true" />
                </button>
              </div>
            )}

            {pending && (
              <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <CircleNotch size={18} className="animate-spin" aria-hidden="true" />
                Přihlašujeme vás…
              </p>
            )}

            {error && (
              <p role="alert" className="mt-4 flex gap-3 text-sm font-medium text-red-700 dark:text-red-400">
                <WarningCircle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}

            <p className="mt-4 text-xs leading-relaxed text-muted">
              Z účtu Google použijeme jen vaše jméno a e-mail. Heslo k Googlu nikdy nevidíme.
            </p>
          </>
        )}
      </div>

      <ul className="grid gap-3">
        {benefits.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3 text-sm text-foreground">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className="pt-1.5">{text}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/venues"
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-foreground underline decoration-line underline-offset-8 hover:decoration-current"
      >
        Zatím se jen rozhlížím – ukázat sportoviště <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
