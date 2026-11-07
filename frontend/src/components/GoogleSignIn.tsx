"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
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

export function GoogleSignIn() {
  const router = useRouter();
  const nextPath = safeNextPath(useSearchParams().get("next"));
  const { user, loading, signIn } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [loading, user, nextPath, router]);

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
            : "Přihlášení se nezdařilo. Zkuste to prosím znovu.",
        );
        setPending(false);
      }
    },
    [signIn],
  );

  useEffect(() => {
    if (!scriptReady || !googleClientId || !buttonRef.current || !window.google) {
      return;
    }
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredential,
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "signin_with",
      locale: "cs",
      width: 300,
    });
  }, [scriptReady, handleCredential]);

  if (!googleClientId) {
    return (
      <p role="alert" className="text-foreground">
        Přihlášení přes Google není nakonfigurované. Nastavte
        <code className="mx-1 rounded bg-page px-1.5 py-0.5 text-sm">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>
        podle <code className="rounded bg-page px-1.5 py-0.5 text-sm">.env.example</code>.
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={buttonRef} aria-busy={pending} className="min-h-11" />
      {pending && <p className="mt-4 text-muted">Přihlašujeme vás…</p>}
      {error && (
        <p role="alert" className="mt-4 font-medium text-red-700">
          {error}
        </p>
      )}
    </>
  );
}
