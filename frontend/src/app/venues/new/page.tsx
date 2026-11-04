import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import { VenueCreateForm } from "@/components/VenueCreateForm";

export const metadata: Metadata = {
  title: "Nové sportoviště · SportSlot",
};

export default function NewVenuePage() {
  return (
    <RequireRole roles={["MANAGER"]}>
      <main className="mx-auto max-w-240 px-4 py-12">
        <h1 className="text-3xl font-bold">Nové sportoviště</h1>
        <VenueCreateForm />
      </main>
    </RequireRole>
  );
}
