import { errorHandler } from "@sportslot/api-format";
import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import request from "supertest";
import { SignJWT } from "jose";
import { createAuthMiddleware } from "../src/middleware/auth.js";

const SECRET = "test-secret-at-least-32-characters-long";
const secretKey = new TextEncoder().encode(SECRET);

const USER_ID = "10000000-0000-4000-8000-000000000001";

function createTestApp() {
  const app = express();

  app.get("/protected", createAuthMiddleware(SECRET), (req, res) => {
    res.json(req.auth);
  });
  app.use(errorHandler);
  return app;
}

async function createToken(
  payload = {
    userId: USER_ID,
    roles: ["PLAYER", "MANAGER"],
  },
  secret = secretKey,
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

test("returns 401 when token is missing", async () => {
  const response = await request(createTestApp()).get("/protected");

  assert.equal(response.status, 401);
  assert.equal(
    response.body.uuAppErrorMap["protected/notAuthenticated"].type,
    "error",
  );
});

test("accepts a valid JWT", async () => {
  const token = await createToken();

  const response = await request(createTestApp())
    .get("/protected")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    userId: USER_ID,
    roles: ["PLAYER", "MANAGER"],
  });
});

test("rejects JWT with invalid signature", async () => {
  const wrongSecret = new TextEncoder().encode(
    "another-test-secret-at-least-32-chars",
  );

  const token = await createToken(undefined, wrongSecret);

  const response = await request(createTestApp())
    .get("/protected")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 401);
});

test("rejects JWT without PLAYER role", async () => {
  const token = await createToken({
    userId: USER_ID,
    roles: ["MANAGER"],
  });

  const response = await request(createTestApp())
    .get("/protected")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 401);
});

test("rejects expired JWT", async () => {
  const token = await new SignJWT({
    userId: USER_ID,
    roles: ["PLAYER"],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
    .sign(secretKey);

  const response = await request(createTestApp())
    .get("/protected")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 401);
});
