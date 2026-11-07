import {
  apiBaseUrl,
  toApiError,
  type DayOfWeek,
  type UuAppErrorMap,
} from "@/lib/api";

export const venuePageSize = 12;

export type VenueListItem = {
  id: string;
  name: string;
  city: string;
  sports: string[];
};

export type VenueList = {
  itemList: VenueListItem[];
  pageInfo: { pageIndex: number; pageSize: number; total: number };
  uuAppErrorMap: UuAppErrorMap;
};

export type VenueSearch = {
  city?: string;
  sport?: string;
  pageIndex?: number;
};

export type Court = {
  id: string;
  name: string;
  sport: string;
  surface: string;
  indoor: boolean;
};

export type VenueDetail = {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string | null;
  openingHours: { dayOfWeek: DayOfWeek; openTime: string; closeTime: string }[];
  courts: Court[];
  uuAppErrorMap: UuAppErrorMap;
};

export async function listVenues({
  city,
  sport,
  pageIndex = 0,
}: VenueSearch): Promise<VenueList> {
  const query = new URLSearchParams({
    pageIndex: String(pageIndex),
    pageSize: String(venuePageSize),
  });
  if (city) query.set("city", city);
  if (sport) query.set("sport", sport);

  const response = await fetch(`${apiBaseUrl}/venue/list?${query}`);
  if (!response.ok) {
    throw await toApiError(response);
  }
  return (await response.json()) as VenueList;
}

export async function getVenue(id: string): Promise<VenueDetail> {
  const response = await fetch(
    `${apiBaseUrl}/venue/get?${new URLSearchParams({ id })}`,
  );
  if (!response.ok) {
    throw await toApiError(response);
  }
  return (await response.json()) as VenueDetail;
}
