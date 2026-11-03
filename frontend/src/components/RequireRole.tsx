"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/api";
import { loginPath, useAuth } from "@/lib/auth";
import { NoPermission } from "@/components/NoPermission";

/**
 * Chrání stránku podle role. Použití v `page.tsx`:
 *   <RequireRole roles={["MANAGER"]}>…obsah stránky…</RequireRole>
 * - bez `roles` stačí libovolný přihlášený uživatel;
 * - nepřihlášeného přesměruje na `/login?next=<aktuální stránka>`;
 * - přihlášený bez žádné z rolí uvidí „Nemáte oprávnění“.
 * Je to jen UX – skutečné oprávnění ověřuje gateway a služby (401 / 403).
 */
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
      <main className="page">
        <p>Načítání…</p>
      </main>
    );
  }

  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <NoPermission />;
  }

  return <>{children}</>;
}
