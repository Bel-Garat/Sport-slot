"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/api";
import { loginPath, useAuth } from "@/lib/auth";
import { NoPermission } from "@/components/NoPermission";

export function RequireRole({
  roles,
  children,
}: {
  roles?: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const { pathname, search, hash } = window.location;
      const next = pathname + search + hash;
      router.replace(`${loginPath}?next=${encodeURIComponent(next)}`);
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="mx-auto max-w-240 px-4 py-12">
        <p className="text-muted">Načítání…</p>
      </main>
    );
  }

  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <NoPermission />;
  }

  return <>{children}</>;
}
