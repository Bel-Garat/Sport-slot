import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import { CourtCreateForm } from "@/components/CourtCreateForm";

export const metadata: Metadata = {
  title: "Nový kurt · SportSlot",
};

export default async function NewCourtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireRole roles={["MANAGER"]}>
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-12">
        <p className="font-semibold text-muted">Pro správce</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Nový kurt
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Přidejte kurt nebo hřiště, které si hráči budou moci rezervovat.
        </p>
        <CourtCreateForm venueId={id} />
      </main>
    </RequireRole>
  );
}
