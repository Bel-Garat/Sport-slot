import express from "express";
import { errorHandler, notFound } from "@sportslot/api-format";

export function createApp({ db } = {}) {
  const app = express();

  app.locals.db = db;

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "venue-service",
    });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
