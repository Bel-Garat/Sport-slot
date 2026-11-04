import Link from "next/link";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" aria-hidden="true">
      <path d="M30 11H15A13 13 0 0 0 15 37L18.5 31.5H15A7.5 7.5 0 0 1 15 16.5H26.5L30 11ZM18 37H33A13 13 0 0 0 33 11L29.5 16.5H33A7.5 7.5 0 0 1 33 31.5H21.5L18 37Z" />
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
