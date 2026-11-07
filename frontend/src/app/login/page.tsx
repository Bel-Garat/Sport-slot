import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPageCard } from "@/components/LoginPageCard";
import { SignInPanelSkeleton } from "@/components/GoogleSignIn";

export const metadata: Metadata = {
  title: "Přihlášení · SportSlot",
};

export default function LoginPage() {
  return (
    <main id="main-content" className="section-wrap flex min-h-[calc(100dvh-5rem)] items-center justify-center py-12">
      <Suspense fallback={<SignInPanelSkeleton />}>
        <LoginPageCard />
      </Suspense>
    </main>
  );
}
