import express from "express";
import { createCourtRouter } from "./routes/court.js";
import { errorHandler, notFound } from "@sportslot/api-format";

export function createApp({
  db,
  gatewaySecret = process.env.GATEWAY_SECRET,
} = {}) {
  const app = express();

  app.locals.db = db;

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "venue-service",
    });
  });

  app.use("/court", createCourtRouter({ db, gatewaySecret }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
