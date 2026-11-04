import Link from "next/link";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" aria-hidden="true">
      <path d="M40 5H20C11.72 5 5 11.72 5 20h7.5a7.5 7.5 0 0 1 7.5-7.5h15L40 5ZM17.25 20.5H38L33.5 27.5H17.25A3.5 3.5 0 0 1 17.25 20.5ZM8 43H28c8.28 0 15-6.72 15-15h-7.5a7.5 7.5 0 0 1-7.5 7.5H13L8 43Z" />
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
