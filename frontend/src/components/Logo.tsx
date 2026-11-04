import Link from "next/link";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8.5 5H44L38 14H8.5A4.5 4.5 0 0 1 8.5 5ZM8.5 19.5H37L31 28.5H8.5A4.5 4.5 0 0 1 8.5 19.5ZM8.5 34H30L24 43H8.5A4.5 4.5 0 0 1 8.5 34Z" />
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
