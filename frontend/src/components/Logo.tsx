import Link from "next/link";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" aria-hidden="true">
      <path d="M39 8H22C12.06 8 4 16.06 4 26h12a6 6 0 0 1 6-6h9L39 8Z" />
      <path d="M9 40h17c9.94 0 18-8.06 18-18H32a6 6 0 0 1-6 6h-9L9 40Z" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="SportSlot, úvodní stránka" className={`inline-flex shrink-0 items-center gap-2.5 rounded-sm font-display text-[27px] leading-none font-bold tracking-[-1.4px] ${className}`}>
      <LogoMark />
      <span>sportslot<span className="text-brand-600">.</span></span>
    </Link>
  );
}
