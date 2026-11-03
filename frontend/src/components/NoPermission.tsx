import Link from "next/link";

export function NoPermission() {
  return (
    <main className="page">
      <h1>Nemáte oprávnění</h1>
      <p>Tato stránka je dostupná jen pro uživatele s jinou rolí.</p>
      <Link href="/">Zpět na úvodní stránku</Link>
    </main>
  );
}
