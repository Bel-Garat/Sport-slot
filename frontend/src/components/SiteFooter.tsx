import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-page">
      <div className="mx-auto max-w-[1360px] px-5 py-12 md:px-10 md:py-16">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div><Logo /><p className="mt-4 max-w-64 text-sm leading-relaxed text-muted">Méně domlouvání. Více hraní.<br />Sport začíná volným časem.</p></div>
          <nav aria-label="Odkazy v patičce" className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm sm:gap-x-20">
            <Link href="/#sporty" className="hover:underline">Najdi svůj sport</Link><Link href="/#pro-spravce" className="hover:underline">Pro sportoviště</Link><Link href="/#jak-to-funguje" className="hover:underline">Jak to funguje</Link><Link href="/#otazky" className="hover:underline">Časté otázky</Link>
          </nav>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-muted">
          <span>© {new Date().getFullYear()} SportSlot</span><a href="/brand/sportslot-brand-kit.zip" download className="inline-flex min-h-11 items-center gap-2 hover:text-foreground">Logo a brand materiály <ArrowUpRight size={15} aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}
