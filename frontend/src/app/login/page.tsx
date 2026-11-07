import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleSignIn } from "@/components/GoogleSignIn";

export const metadata: Metadata = {
  title: "Přihlášení · SportSlot",
};

export default function LoginPage() {
  return (
    <main id="main-content" className="mx-auto max-w-xl px-4 py-16 md:py-24">
      <p className="font-semibold text-muted">Účet SportSlot</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">
        Přihlášení
      </h1>
      <p className="mt-4 text-lg text-muted">
        Přihlaste se účtem Google. Při prvním přihlášení vám založíme účet hráče.
      </p>
      <div className="mt-10 rounded-3xl border border-line bg-surface p-6 md:p-8">
        <Suspense fallback={<p className="text-muted">Načítání…</p>}>
          <GoogleSignIn />
        </Suspense>
      </div>
    </main>
  );
}
