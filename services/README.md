# Services

Backend mikroslužby (Express.js) - např. auth-service, venue-service.

Každá služba vychází ze stejné šablony: `src/app.js` (Express aplikace, `GET /health`), `src/server.js` (spuštění na portu z `.env`) a `test/` (testy přes `node --test` a supertest).
Rozdělení služeb odpovídá vlastnictví dat z datového modelu (A.6): auth (users), venue (venues, courts, price_rules), reservation (reservations), review (reviews), audit (audit_logs).
