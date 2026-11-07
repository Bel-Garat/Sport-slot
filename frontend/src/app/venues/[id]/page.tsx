import type { Metadata } from "next";
import { VenueDetail } from "@/components/VenueDetail";

export const metadata: Metadata = {
  title: "Detail sportoviště · SportSlot",
};

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VenueDetail id={id} />;
}
