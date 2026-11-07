"use client";

import { useEffect } from "react";
import { LockSimple } from "@phosphor-icons/react";
import type { Role } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { NoPermission } from "@/components/NoPermission";

export function RequireRole({
  roles,
  reason = "Tato stránka je dostupná jen přihlášeným uživatelům.",
  children,
}: {
  roles?: Role[];
  reason?: string;
  children: React.ReactNode;
}) {
  const { user, loading, openLogin } = useAuth();

  useEffect(() => {
    if (!loading && !user) openLogin(reason);
  }, [loading, user, openLogin, reason]);

  if (loading) {
    return (
      <main className="section-wrap py-16" aria-busy="true">
        <div aria-hidden="true" className="mx-auto h-48 max-w-xl animate-pulse rounded-3xl bg-surface" />
      </main>
    );
  }

  if (!user) {
    return (
      <main id="main-content" className="section-wrap py-16 md:py-24">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-line px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-surface text-muted">
            <LockSimple size={26} aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold text-foreground">Nejdřív se přihlaste</h1>
          <p className="mt-2 max-w-md text-muted">{reason}</p>
          <button type="button" onClick={() => openLogin(reason)} className="button button-dark mt-6">
            Přihlásit se
          </button>
        </div>
      </main>
    );
  }

  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <NoPermission />;
  }

  return <>{children}</>;
}
