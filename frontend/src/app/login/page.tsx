import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { GoogleSignIn, GoogleSignInSkeleton } from "@/components/GoogleSignIn";

export const metadata: Metadata = {
  title: "Přihlášení · SportSlot",
};

export default function LoginPage() {
  return (
    <main id="main-content" className="section-wrap py-10 md:py-16">
      <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
        <section className="flex flex-col justify-center lg:py-10">
          <p className="eyebrow">Účet SportSlot</p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.05] font-semibold tracking-[-.045em] text-foreground">
            Přihlaste se
            <br />
            a jdeme hrát.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            Stačí účet Google. Při prvním přihlášení vám automaticky založíme účet hráče.
          </p>
          <div className="mt-8 max-w-md">
            <Suspense fallback={<GoogleSignInSkeleton />}>
              <GoogleSignIn />
            </Suspense>
          </div>
        </section>
        <aside className="relative hidden min-h-[560px] overflow-hidden rounded-[2rem] lg:block">
          <Image
            src="/images/tennis-hero.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 0px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="font-display text-3xl leading-tight font-semibold tracking-[-.03em]">
              Méně domlouvání.
              <br />
              Více hraní.
            </p>
            <p className="mt-3 max-w-sm text-white/80">
              Najděte sportoviště ve svém městě a zjistěte, kde a kdy si zahrát.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
