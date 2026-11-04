"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, List, User, X } from "@phosphor-icons/react";
import { Logo } from "@/components/Logo";
import { loginPath, useAuth } from "@/lib/auth";

const links = [
  { href: "/#sporty", label: "Najdi svůj sport" },
  { href: "/#jak-to-funguje", label: "Jak to funguje" },
  { href: "/#o-sportslotu", label: "O SportSlotu" },
  { href: "/#pro-spravce", label: "Pro sportoviště" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const showLogin = !loading && !user;

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

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
          {showLogin && (
            <Link
              href={loginPath}
              className="button button-dark group hidden gap-3 pl-2 sm:inline-flex"
            >
              <SignInBadge />
              Přihlásit se
            </Link>
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
        {showLogin && (
          <Link
            href={loginPath}
            onClick={() => setOpen(false)}
            className="button button-dark group mt-3 w-full gap-3 sm:hidden"
          >
            <SignInBadge />
            Přihlásit se
          </Link>
        )}
      </nav>
    </header>
  );
}

function SignInBadge() {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 items-center justify-center rounded-full bg-ball text-brand-900 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
    >
      <User size={16} weight="bold" />
    </span>
  );
}
