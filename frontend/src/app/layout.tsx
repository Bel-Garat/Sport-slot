import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "SportSlot – rezervace sportovišť a kurtů",
  description:
    "Najděte sportoviště ve svém městě, podívejte se na volné termíny a zarezervujte si kurt během minuty. Správci sportovišť mají rezervace, ceník i otevírací dobu na jednom místě.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="flex min-h-dvh flex-col bg-brand-50/40 font-sans text-ink-900 antialiased">
        <AuthProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
