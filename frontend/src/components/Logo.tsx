import Link from "next/link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--color-brand-900)" />
      <rect
        x="7"
        y="7"
        width="18"
        height="18"
        rx="2"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <path d="M16 7v18" stroke="white" strokeWidth="2" />
      <circle cx="21.5" cy="12" r="3.5" fill="var(--color-ball)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-md font-display text-xl font-bold tracking-tight text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
    >
      <LogoMark />
      <span>
        Sport<span className="text-brand-600">Slot</span>
      </span>
    </Link>
  );
}
