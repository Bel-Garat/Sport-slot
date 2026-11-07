import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import express from "express";
import request from "supertest";
import { SignJWT } from "jose";
import { createApp } from "../src/app.js";
import { serviceUrlsFromEnv } from "../src/routes.js";

const JWT_SECRET = "test-jwt-secret-at-least-32-characters";
const GATEWAY_SECRET = "test-gateway-secret-at-least-32-characters";
const USER_ID = "10000000-0000-4000-8000-000000000001";
const CONFIG = { jwtSecret: JWT_SECRET, gatewaySecret: GATEWAY_SECRET };

let authServer;
let serviceUrls;

before(async () => {
  const auth = express();
  auth.get("/user/me", (req, res) => {
    res.json({ path: req.path, headers: req.headers });
  });
  authServer = await new Promise((resolve) => {
    const server = auth.listen(0, "127.0.0.1", () => resolve(server));
  });
  serviceUrls = {
    ...serviceUrlsFromEnv({}),
    auth: `http://127.0.0.1:${authServer.address().port}`,
  };
});

after(async () => {
  await new Promise((resolve) => authServer.close(resolve));
});

test("GET /api/user/me without a token returns 401", async () => {
  const response = await request(createApp(serviceUrls, CONFIG)).get(
    "/api/user/me",
  );

  assert.equal(response.status, 401);
});

test("GET /api/user/me forwards the verified user to auth-service", async () => {
  const token = await new SignJWT({ userId: USER_ID, roles: ["PLAYER"] })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(JWT_SECRET));

  const response = await request(createApp(serviceUrls, CONFIG))
    .get("/api/user/me")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.path, "/user/me");
  assert.equal(response.body.headers["x-user-id"], USER_ID);
  assert.equal(response.body.headers["x-gateway-secret"], GATEWAY_SECRET);
});
