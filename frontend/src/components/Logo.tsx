import Link from "next/link";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 17h32a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V22a5 5 0 0 1 5-5Zm0 2.4a2.6 2.6 0 0 0-2.6 2.6v16a2.6 2.6 0 0 0 2.6 2.6h32a2.6 2.6 0 0 0 2.6-2.6V22a2.6 2.6 0 0 0-2.6-2.6H8Z" />
      <path d="M7 21h6.2v18H7zM14.8 21h8.4v8.2h-8.4zM14.8 30.8h8.4V39h-8.4zM24.8 21h8.4v8.2h-8.4zM24.8 30.8h8.4V39h-8.4zM34.8 21H41v18h-6.2z" />
      <circle cx="38" cy="8.5" r="5.5" />
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
