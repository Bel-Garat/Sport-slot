import Link from "next/link";

export function NoPermission() {
  return (
    <main className="mx-auto max-w-240 px-4 py-12">
      <h1 className="text-3xl font-bold">Nemáte oprávnění</h1>
      <p className="mt-4">Tato stránka je dostupná jen pro uživatele s jinou rolí.</p>
      <Link href="/" className="mt-4 inline-block underline">Zpět na úvodní stránku</Link>
    </main>
  );
}
