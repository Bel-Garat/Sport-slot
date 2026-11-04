"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, X, Check } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";

export function OwnerCta() {
  const { user, loading } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const canCreate = user?.roles.includes("MANAGER");
  if (!loading && canCreate) return <Link href="/venues/new" className="button button-primary">Přidat sportoviště <ArrowUpRight size={18} aria-hidden="true" /></Link>;
  return <>
    <button type="button" className="button button-primary" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>Přidat sportoviště <ArrowUpRight size={18} aria-hidden="true" /></button>
    <dialog ref={dialog} className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-line bg-page p-6 text-foreground shadow-2xl backdrop:bg-black/60 sm:p-8" aria-labelledby="owner-title" onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="flex items-start justify-between gap-4"><h2 id="owner-title" className="font-display text-2xl font-bold tracking-tight">Vaše sportoviště ve SportSlotu</h2><button className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line" type="button" aria-label="Zavřít informace" onClick={() => dialog.current?.close()}><X size={20} aria-hidden="true" /></button></div>
      <p className="mt-5 text-sm leading-relaxed text-muted">Založení sportoviště je dostupné přihlášeným správcům. Veřejnou registraci zatím připravujeme.</p>
      <p className="mt-6 font-semibold">Co budete potřebovat</p>
      <ul className="mt-4 grid gap-3 text-sm">{["Název a adresu sportoviště", "Otevírací dobu pro jednotlivé dny", "Krátký popis areálu"].map(item => <li key={item} className="flex items-center gap-3"><Check size={18} className="text-brand-600" aria-hidden="true" />{item}</li>)}</ul>
      <form method="dialog" className="mt-8"><button className="button button-dark w-full">Rozumím</button></form>
    </dialog>
  </>;
}
