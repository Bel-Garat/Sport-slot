import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { RequireRole } from "@/components/RequireRole";
import { VenueCreateForm } from "@/components/VenueCreateForm";

export const metadata: Metadata = {
  title: "Nové sportoviště · SportSlot",
};

export default function NewVenuePage() {
  return (
    <RequireRole roles={["MANAGER"]} reason="Sportoviště může založit jen přihlášený správce. Po přihlášení budete pokračovat tady.">
      <main id="main-content" className="section-wrap pt-7 pb-20 md:pt-10">
        <Link href="/venues" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-muted hover:text-foreground"><ArrowLeft size={16} aria-hidden="true" /> Zpět na sportoviště</Link>
        <p className="eyebrow mt-6">Pro správce sportovišť</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.08] font-semibold tracking-[-.045em]">
          Nové sportoviště
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          Dejte hráčům vědět, kde vás najdou a kdy máte otevřeno.
        </p>
        <ol aria-label="Postup založení" className="mt-6 flex flex-wrap items-center gap-3 text-sm sm:gap-4">
          <li aria-current="step" className="flex items-center gap-2 font-semibold"><span className="flex size-7 items-center justify-center rounded-full bg-foreground text-xs text-page">1</span> Sportoviště</li>
          <li className="flex items-center gap-3 text-muted"><CaretRight size={13} aria-hidden="true" /><span className="flex size-7 items-center justify-center rounded-full border border-line text-xs">2</span> Kurty a hřiště</li>
        </ol>
        <VenueCreateForm />
      </main>
    </RequireRole>
  );
}
