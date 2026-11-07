"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, List, Plus, SignOut, X } from "@phosphor-icons/react";
import { Logo } from "@/components/Logo";
import { Avatar, RoleBadges, UserMenu } from "@/components/UserMenu";
import { loginPath, logout, useAuth } from "@/lib/auth";

const links = [
  { href: "/venues", label: "Sportoviště" },
  { href: "/#sporty", label: "Najdi svůj sport" },
  { href: "/#jak-to-funguje", label: "Jak to funguje" },
  { href: "/#o-sportslotu", label: "O SportSlotu" },
  { href: "/#pro-spravce", label: "Pro sportoviště" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, openLogin } = useAuth();
  const pathname = usePathname();
  const onLoginPage = pathname === loginPath;
  const showLogin = !loading && !user && !onLoginPage;

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      data-scrolled={scrolled}
      className="sticky top-0 z-30 border-b border-transparent bg-page/95 backdrop-blur-md transition-[border-color,box-shadow] duration-300 data-[scrolled=true]:border-line/70 data-[scrolled=true]:shadow-[0_8px_30px_-12px_rgba(23,59,43,.25)]"
    >
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-5 px-5 md:h-22 md:px-10">
        <Logo className="transition-transform duration-300 hover:-rotate-2" />
        <nav
          aria-label="Hlavní navigace"
          className="hidden items-center gap-8 text-[13px] font-medium lg:flex"
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {loading && (
            <span
              aria-hidden="true"
              className="hidden h-11 w-32 animate-pulse rounded-full bg-surface sm:block"
            />
          )}
          {user && (
            <div className="hidden sm:block">
              <UserMenu user={user} />
            </div>
          )}
          {showLogin && (
            <button
              type="button"
              onClick={() => openLogin()}
              className="button button-dark hidden sm:inline-flex"
            >
              Přihlásit se
            </button>
          )}
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-line transition-colors hover:bg-surface lg:hidden"
            aria-label={open ? "Zavřít navigaci" : "Otevřít navigaci"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X size={22} aria-hidden="true" />
            ) : (
              <List size={22} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        aria-label="Mobilní navigace"
        hidden={!open}
        className="mobile-nav border-t border-line px-5 py-4 lg:hidden"
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        {user && (
          <div className="mb-3 rounded-2xl bg-surface p-4 sm:hidden">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <div className="mt-3">
              <RoleBadges user={user} />
            </div>
          </div>
        )}
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center justify-between py-3 text-base font-medium"
          >
            {link.label}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        ))}
        {user?.roles.includes("MANAGER") && (
          <Link
            href="/venues/new"
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center justify-between py-3 text-base font-medium sm:hidden"
          >
            Přidat sportoviště
            <Plus size={18} aria-hidden="true" />
          </Link>
        )}
        {user && (
          <button
            type="button"
            onClick={logout}
            className="button button-outline mt-3 w-full sm:hidden"
          >
            Odhlásit se <SignOut size={18} aria-hidden="true" />
          </button>
        )}
        {showLogin && (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openLogin();
            }}
            className="button button-dark mt-3 w-full sm:hidden"
          >
            Přihlásit se
          </button>
        )}
      </nav>
    </header>
  );
}
