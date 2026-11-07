import type { Metadata } from "next";
import { Suspense } from "react";
import { VenueSearch, VenueSearchSkeleton } from "@/components/VenueSearch";

export const metadata: Metadata = {
  title: "Sportoviště · SportSlot",
};

export default function VenuesPage() {
  return (
    <main id="main-content" className="pb-20">
      <section className="border-b border-line bg-surface/50">
        <div className="section-wrap pt-12 pb-10 md:pt-16 md:pb-12">
          <p className="eyebrow">Najdi, kde si zahrát</p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.75rem)] leading-[1.05] font-semibold tracking-[-.045em] text-foreground">
            Sportoviště
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Vyhledejte sportoviště podle města a sportu. Na velikosti písmen ani diakritice
            nezáleží – „plzen“ najde i Plzeň.
          </p>
        </div>
      </section>
      <div className="section-wrap">
        <Suspense fallback={<VenueSearchSkeleton />}>
          <VenueSearch />
        </Suspense>
      </div>
    </main>
  );
}
