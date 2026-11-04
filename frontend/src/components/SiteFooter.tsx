import { LogoMark } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <LogoMark className="size-5" />
          SportSlot – rezervace sportovišť a kurtů
        </span>
        <span>© 2026 SportSlot</span>
      </div>
    </footer>
  );
}
