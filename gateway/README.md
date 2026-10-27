# Gateway

API brána pro mikroslužby.

Přijímá požadavky na `/api/…` a předává je službě, která danou oblast vlastní (bez prefixu `/api`):

| Cesta | Služba |
|---|---|
| `/api/auth/…` | auth-service |
| `/api/venue/…`, `/api/court/…`, `/api/priceRule/…` | venue-service |
| `/api/reservation/…` | reservation-service |
| `/api/review/…` | review-service |
| `/api/audit/…` | audit-service |

Adresy služeb se nastavují v `.env` (`*_SERVICE_URL`), výchozí jsou `http://localhost:4001`–`4005`.
`GET /health` vrací stav gateway. Ověření přihlášení přes auth-service se doplní spolu s auth-service.
