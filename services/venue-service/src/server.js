import { createApp } from "./app.js";
import { createDb } from "./db.js";
import { createVenueDao } from "./venueDao.js";

const port = Number(process.env.VENUE_SERVICE_PORT ?? 4002);

const db = createDb();

const app = createApp({ db, venueDao: createVenueDao(db) });

const server = app.listen(port, () => {
  console.log(`venue-service listening on http://localhost:${port}`);
});

async function shutdown() {
  server.close(async () => {
    await db.$disconnect();
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
