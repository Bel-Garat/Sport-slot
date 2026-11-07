import type { Metadata } from "next";
import { Suspense } from "react";
import { VenueSearch, VenueSearchSkeleton } from "@/components/VenueSearch";

export const metadata: Metadata = {
  title: "Sportoviště · SportSlot",
};

export default function VenuesPage() {
  return (
    <main id="main-content" className="pb-20">
      <section>
        <div className="section-wrap pt-10 pb-8 md:pt-14 md:pb-10">
          <p className="eyebrow">Místo pro vaši další hru</p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.75rem)] leading-[1.05] font-semibold tracking-[-.045em] text-foreground">
            Sportoviště
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            Najděte svůj kurt, halu nebo hřiště. Stačí vybrat město a sport.
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
