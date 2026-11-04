import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import { VenueCreateForm } from "@/components/VenueCreateForm";

export const metadata: Metadata = {
  title: "Nové sportoviště · SportSlot",
};

export default function NewVenuePage() {
  return (
    <RequireRole roles={["MANAGER"]}>
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-12">
        <p className="font-semibold text-muted">Pro správce</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Nové sportoviště
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Vyplňte, kde vás hráči najdou a kdy máte otevřeno.
        </p>
        <VenueCreateForm />
      </main>
    </RequireRole>
  );
}
