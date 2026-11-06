import assert from "node:assert/strict";
import { test } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";

const VENUE_ID = "30000000-0000-4000-8000-000000000001";
const COURT_ID = "50000000-0000-4000-8000-000000000003";

test("GET /court/list returns courts for a venue", async () => {
  const db = {
    venue: {
      findUnique: async () => ({ id: VENUE_ID }),
    },
    court: {
      count: async () => 1,
      findMany: async () => [
        {
          id: COURT_ID,
          venueId: VENUE_ID,
          name: "Hřiště 3",
          sport: "volejbal",
          surface: "Odpružený akrylátový povrch",
          indoor: false,
        },
      ],
    },
  };

  const response = await request(createApp({ db }))
    .get("/court/list")
    .query({ venueId: VENUE_ID });

  assert.equal(response.status, 200);
  assert.equal(response.body.itemList.length, 1);
  assert.equal(response.body.itemList[0].id, COURT_ID);
});
