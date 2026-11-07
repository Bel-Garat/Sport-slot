"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X } from "@phosphor-icons/react";
import { LogoMark } from "@/components/Logo";
import { SignInPanel } from "@/components/GoogleSignIn";
import { useAuth } from "@/lib/auth";

export function LoginDialog() {
  const { user, loginOpen, loginReason, closeLogin } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (loginOpen && !user && !dialog.open) dialog.showModal();
    if ((!loginOpen || user) && dialog.open) dialog.close();
  }, [loginOpen, user]);

  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    closeLogin();
  }, [pathname, closeLogin]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="login-dialog-title"
      aria-describedby="login-dialog-description"
      onClose={closeLogin}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeLogin();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[460px] overflow-y-auto rounded-3xl border border-line bg-page p-0 text-foreground shadow-[0_40px_120px_-40px_rgba(10,30,20,.7)] backdrop:bg-brand-900/55 backdrop:backdrop-blur-sm"
    >
      {loginOpen && (
        <div className="relative p-6 sm:p-9">
          <button
            type="button"
            onClick={closeLogin}
            aria-label="Zavřít přihlášení"
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-ball text-brand-900"><LogoMark className="size-9" /></span>
          <h2 id="login-dialog-title" className="mt-6 max-w-72 font-display text-[2rem] leading-[1.12] font-semibold tracking-[-.04em]">
            Přihlášení do SportSlotu
          </h2>
          <p id="login-dialog-description" className="mt-3 text-sm leading-relaxed text-muted">
            Jeden účet pro vaši další hru. Pokračujte přes Google, bez dalšího hesla.
          </p>
          <div className="mt-6">
            <SignInPanel reason={loginReason} onSignedIn={closeLogin} onBrowse={closeLogin} />
          </div>
        </div>
      )}
    </dialog>
  );
}
