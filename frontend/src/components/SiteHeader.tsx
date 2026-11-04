import { Logo } from "@/components/Logo";

export function SiteHeader() {
  return (
    <header className="border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
      </div>
    </header>
  );
}
