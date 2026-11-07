import type { Metadata } from "next";
import { Suspense } from "react";
import { VenueSearch } from "@/components/VenueSearch";

export const metadata: Metadata = {
  title: "Sportoviště · SportSlot",
};

export default function VenuesPage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <p className="font-semibold text-muted">Najdi, kde si zahrát</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Sportoviště
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Hledejte podle města a sportu. Na velikosti písmen ani diakritice nezáleží.
      </p>
      <Suspense fallback={<p className="mt-10 text-muted">Načítání…</p>}>
        <VenueSearch />
      </Suspense>
    </main>
  );
}
