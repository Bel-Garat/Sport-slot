import assert from "node:assert/strict";
import { test } from "node:test";
import { createVenueDao } from "../src/venueDao.js";

const VENUE_ID = "00000000-0000-4000-8000-000000000101";

test("get formats opening hours as HH:MM", async () => {
  const db = {
    venue: {
      findUnique: async ({ where }) => ({
        id: where.id,
        name: "Sportcentrum",
        address: "Sportovní 1",
        city: "Praha",
        description: null,
        openingHours: [
          {
            dayOfWeek: 1,
            openTime: new Date("1970-01-01T07:00:00Z"),
            closeTime: new Date("1970-01-01T22:30:00Z"),
          },
        ],
        courts: [],
      }),
    },
  };

  const venue = await createVenueDao(db).get(VENUE_ID);

  assert.deepEqual(venue.openingHours, [
    { dayOfWeek: 1, openTime: "07:00", closeTime: "22:30" },
  ]);
});

test("get returns null for an unknown venue", async () => {
  const db = { venue: { findUnique: async () => null } };

  assert.equal(await createVenueDao(db).get(VENUE_ID), null);
});

test("list returns venues with the sports of their courts", async () => {
  const venues = [
    { id: VENUE_ID, name: "Sportcentrum", city: "Praha", courts: [{ sport: "fotbal" }] },
  ];
  const db = { venue: { findMany: async () => venues } };

  assert.deepEqual(await createVenueDao(db).list(), venues);
});
