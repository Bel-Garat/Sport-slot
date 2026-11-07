import { apiBaseUrl, authHeaders, toApiError, type UuAppErrorMap } from "@/lib/api";
import type { Court } from "@/lib/venues";

export const courtLimits = {
  name: 50,
  sport: 50,
  surface: 100,
} as const;

export type CourtCreateDtoIn = {
  venueId: string;
  name: string;
  sport: string;
  surface: string;
  indoor: boolean;
};

export type CreatedCourt = Court & {
  venueId: string;
  uuAppErrorMap: UuAppErrorMap;
};

export async function createCourt(dtoIn: CourtCreateDtoIn): Promise<CreatedCourt> {
  const response = await fetch(`${apiBaseUrl}/court/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(dtoIn),
  });
  if (!response.ok) {
    throw await toApiError(response);
  }
  return (await response.json()) as CreatedCourt;
}
