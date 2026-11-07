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
    <div className="w-full max-w-[440px] rounded-3xl border border-line bg-page p-7 shadow-[0_40px_120px_-50px_rgba(10,30,20,.6)] sm:p-8">
      <LogoMark className="h-8 w-auto" />
      <h1 className="mt-5 font-display text-[1.9rem] leading-tight font-semibold tracking-[-.035em] text-foreground">
        Přihlaste se do SportSlotu
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Pokračujte účtem Google. Pokud ho u nás používáte poprvé, účet vám rovnou založíme.
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
