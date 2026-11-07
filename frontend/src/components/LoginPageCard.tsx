"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react";
import { LogoMark } from "@/components/Logo";
import { SignInPanel } from "@/components/GoogleSignIn";
import { safeNextPath, useAuth } from "@/lib/auth";

export function LoginPageCard() {
  const router = useRouter();
  const nextPath = safeNextPath(useSearchParams().get("next"));
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace(nextPath);
  }, [loading, user, nextPath, router]);

  return (
    <div className="w-full max-w-[460px] rounded-3xl border border-line bg-page p-6 shadow-[0_24px_70px_-40px_rgba(10,30,20,.35)] sm:p-9">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-ball text-brand-900"><LogoMark className="size-9" /></span>
      <h1 className="mt-6 max-w-72 font-display text-[2rem] leading-[1.12] font-semibold tracking-[-.04em] text-foreground">
        Přihlášení do SportSlotu
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Jeden účet pro vaši další hru. Pokračujte přes Google, bez dalšího hesla.
      </p>
      <div className="mt-6">
        {!loading && user ? (
          <p className="flex items-center gap-2 text-sm text-muted" role="status">
            <CircleNotch size={18} className="animate-spin" aria-hidden="true" />
            Přihlášen jako {user.name}, přesměrováváme…
          </p>
        ) : (
          <SignInPanel />
        )}
      </div>
    </div>
  );
}
