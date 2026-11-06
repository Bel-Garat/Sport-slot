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

test("GET /court/list returns 400 when venueId is missing", async () => {
  const response = await request(createApp({ db: {} }))
    .get("/court/list");

  assert.equal(response.status, 400);

  assert.equal(
    response.body.uuAppErrorMap["court/list/invalidDtoIn"].type,
    "error",
  );

  assert.ok(
    response.body.uuAppErrorMap["court/list/invalidDtoIn"]
      .paramMap.missingKeyMap.venueId,
  );
});

test("GET /court/list returns 400 for invalid venueId", async () => {
  const response = await request(createApp({ db: {} }))
    .get("/court/list")
    .query({ venueId: "not-a-valid-uuid" });

  assert.equal(response.status, 400);

  assert.equal(
    response.body.uuAppErrorMap["court/list/invalidDtoIn"].type,
    "error",
  );
});

test("GET /court/list returns 404 for unknown venue", async () => {
  const db = {
    venue: {
      findUnique: async () => null,
    },
  };

  const response = await request(createApp({ db }))
    .get("/court/list")
    .query({ venueId: VENUE_ID });

  assert.equal(response.status, 404);

  assert.equal(
    response.body.uuAppErrorMap["court/list/venueDoesNotExist"].type,
    "error",
  );
});

test("GET /court/list returns empty list when venue has no courts", async () => {
  const db = {
    venue: {
      findUnique: async () => ({ id: VENUE_ID }),
    },
    court: {
      count: async () => 0,
      findMany: async () => [],
    },
  };

  const response = await request(createApp({ db }))
    .get("/court/list")
    .query({ venueId: VENUE_ID });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.itemList, []);

  assert.deepEqual(response.body.pageInfo, {
    pageIndex: 0,
    pageSize: 20,
    total: 0,
  });

  assert.deepEqual(response.body.uuAppErrorMap, {});
});

test("GET /court/list supports pagination", async () => {
  const courts = Array.from({ length: 5 }, (_, index) => ({
    id: `50000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    venueId: VENUE_ID,
    name: `Hřiště ${index + 1}`,
    sport: "volejbal",
    surface: "Umělý povrch",
    indoor: false,
  }));

  const db = {
    venue: {
      findUnique: async () => ({ id: VENUE_ID }),
    },
    court: {
      count: async () => courts.length,
      findMany: async ({ skip, take }) => courts.slice(skip, skip + take),
    },
  };

  const response = await request(createApp({ db }))
    .get("/court/list")
    .query({
      venueId: VENUE_ID,
      pageIndex: 1,
      pageSize: 2,
    });

  assert.equal(response.status, 200);

  assert.equal(response.body.itemList.length, 2);
  assert.equal(response.body.itemList[0].id, courts[2].id);
  assert.equal(response.body.itemList[1].id, courts[3].id);

  assert.deepEqual(response.body.pageInfo, {
    pageIndex: 1,
    pageSize: 2,
    total: 5,
  });
});

test("GET /court/list returns 400 for invalid pageIndex", async () => {
  const response = await request(createApp({ db: {} }))
    .get("/court/list")
    .query({
      venueId: VENUE_ID,
      pageIndex: -1,
    });

  assert.equal(response.status, 400);

  assert.equal(
    response.body.uuAppErrorMap["court/list/invalidDtoIn"].type,
    "error",
  );
});

test("GET /court/list returns 400 for invalid pageSize", async () => {
  const response = await request(createApp({ db: {} }))
    .get("/court/list")
    .query({
      venueId: VENUE_ID,
      pageSize: 0,
    });

  assert.equal(response.status, 400);

  assert.equal(
    response.body.uuAppErrorMap["court/list/invalidDtoIn"].type,
    "error",
  );
});