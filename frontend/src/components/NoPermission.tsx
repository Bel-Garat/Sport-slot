import Link from "next/link";

export function NoPermission() {
  return (
    <main className="mx-auto max-w-240 px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-foreground">Nemáte oprávnění</h1>
      <p className="mt-4 text-muted">Tato stránka je dostupná jen pro uživatele s jinou rolí.</p>
      <Link href="/" className="mt-6 inline-block font-medium text-foreground underline underline-offset-4 hover:text-brand-600">Zpět na úvodní stránku</Link>
    </main>
  );
}
