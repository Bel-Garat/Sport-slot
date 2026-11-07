import type { Metadata } from "next";
import { VenueDetail } from "@/components/VenueDetail";

export const metadata: Metadata = {
  title: "Detail sportoviště · SportSlot",
};

export default async function VenueDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  let backHref = "/venues";
  if (typeof from === "string") {
    try {
      const url = new URL(from, "https://sportslot.invalid");
      if (url.origin === "https://sportslot.invalid" && url.pathname === "/venues") {
        backHref = `${url.pathname}${url.search}`;
      }
    } catch { /* Invalid return links fall back to the venue directory. */ }
  }
  return <VenueDetail id={id} backHref={backHref} />;
}
