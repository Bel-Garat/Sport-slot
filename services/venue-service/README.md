# Venue Service – SportSlot

## Overview

`venue-service` je backendová mikroslužba projektu SportSlot postavená na Node.js 22 a Express 5. Spravuje sportoviště, kurty a navazující data.

Aktuální implementace zahrnuje dva endpointy:

- `GET /court/list` – získání kurtů daného sportoviště.
- `POST /court/create` – vytvoření kurtu správcem sportoviště.

Veřejné API je dostupné přes API Gateway.

## Architecture

Tok HTTP požadavku:

Frontend / Postman → API Gateway → Venue Service → Prisma ORM → Supabase PostgreSQL

Výchozí adresy:

- Gateway: `http://localhost:4000`
- Venue Service: `http://localhost:4002`

Gateway převádí například `/api/court/list` na `/court/list` v interní službě.

### Project structure

- `src/app.js` – vytvoření Express aplikace, registrace rout a error handlerů.
- `src/server.js` – spuštění HTTP serveru a ukončení databázového připojení.
- `src/db.js` – inicializace Prisma Client pomocí PostgreSQL adapteru.
- `src/routes/court.js` – implementace `court/list` a `court/create`.
- `test/app.test.js` – základní test dostupnosti služby.
- `test/court.test.js` – automatické testy endpointů pro kurty.

## GET /court/list

**Účel:** Zobrazit kurty vybraného sportoviště.

**Veřejná URL:** `GET /api/court/list`

**Autentizace:** Není vyžadována.

### Query parameters

| Parameter | Type | Required | Default |
|---|---|---|---|
| `venueId` | UUID string | Yes | – |
| `pageIndex` | Non-negative integer | No | 0 |
| `pageSize` | Positive integer | No | 20 |

Příklad požadavku s ID testovacího sportoviště:

`GET http://localhost:4000/api/court/list?venueId=00000000-0000-4000-8000-000000000101`

### Success response – HTTP 200

```json
{
  "itemList": [
    {
      "id": "00000000-0000-4000-8000-000000000203",
      "venueId": "00000000-0000-4000-8000-000000000101",
      "name": "Hřiště 3",
      "sport": "volejbal",
      "surface": "Odpružený akrylátový povrch",
      "indoor": false
    }
  ],
  "pageInfo": {
    "pageIndex": 0,
    "pageSize": 20,
    "total": 4
  },
  "uuAppErrorMap": {}
}
```

*Ukázka obsahuje pouze jeden záznam v `itemList`; skutečný seznam může obsahovat další kurty.*

Kurty jsou řazeny podle názvu a následně ID. Stránkování se provádí pomocí Prisma `skip` a `take`.

### Errors

- `400 invalidDtoIn` – neplatné nebo chybějící parametry.
- `404 venueDoesNotExist` – sportoviště neexistuje.

Existující sportoviště bez kurtů vrací HTTP 200 s prázdným `itemList` a `total: 0`.

## POST /court/create

**Účel:** Vytvořit nový kurt v existujícím sportovišti.

**Veřejná URL:** `POST /api/court/create`

**Autentizace:** JWT Bearer Token.

**Autorizace:** Uživatel musí mít role `PLAYER` a `MANAGER` a být vlastníkem zadaného sportoviště.

### Request body

| Field | Type | Required | Validation |
|---|---|---|---|
| `venueId` | string | Yes | Platné UUID |
| `name` | string | Yes | 1–50 znaků, nesmí být pouze mezery |
| `sport` | string | Yes | 1–50 znaků, nesmí být pouze mezery |
| `surface` | string | Yes | 1–100 znaků, nesmí být pouze mezery |
| `indoor` | boolean | Yes | `true` nebo `false` |

Příklad JSON požadavku:

```json
{
  "venueId": "00000000-0000-4000-8000-000000000101",
  "name": "Nový volejbalový kurt",
  "sport": "volejbal",
  "surface": "Umělý povrch",
  "indoor": false
}
```

### Request processing

1. Gateway ověří JWT a roli `MANAGER`.
2. Gateway předá ověřenou identitu a interní tajný klíč do venue-service.
3. Venue-service ověří interní klíč, ID uživatele a požadované role.
4. Následuje validace JSON požadavku.
5. Prisma vyhledá sportoviště a jeho `managerId`.
6. Služba ověří, zda je přihlášený uživatel vlastníkem sportoviště.
7. Prisma vytvoří nový záznam v tabulce `venue.courts`.
8. Služba vrátí vytvořený kurt.

### Success response – HTTP 200

```json
{
  "id": "<generated-uuid>",
  "venueId": "00000000-0000-4000-8000-000000000101",
  "name": "Nový volejbalový kurt",
  "sport": "volejbal",
  "surface": "Umělý povrch",
  "indoor": false,
  "uuAppErrorMap": {}
}
```

### Errors

- `400 invalidDtoIn` – neplatná vstupní data.
- `401 notAuthenticated` – chybějící nebo neplatná identita.
- `403 notAuthorized` – nedostatečná role nebo cizí sportoviště.
- `404 venueDoesNotExist` – sportoviště neexistuje.
- `409 courtAlreadyExists` – kurt se stejným názvem v daném sportovišti již existuje.
- `503 gatewayUnavailable` – interní ověření gateway není nakonfigurováno.

## Authentication and security

Frontend posílá JWT výhradně do Gateway pomocí hlavičky `Authorization: Bearer <token>`.

Gateway ověřuje podpis tokenu a následně předává důvěryhodné interní hlavičky `x-user-id`, `x-user-roles` a `x-gateway-secret`.

`venue-service` pro `court/create` kontroluje interní tajný klíč a vlastnictví sportoviště. Klient nesmí interní hlavičky podvrhovat.

Hodnoty `JWT_SECRET`, `GATEWAY_SECRET` a `DATABASE_URL` jsou uložené v root `.env` a nesmí být commitovány.

## Local development

Požadavky: Node.js 22+, npm a přístup k nakonfigurované databázi.

Z kořenové složky repozitáře:

```bash
npm ci
npm exec --workspace @sportslot/db -- prisma generate
```

Zkopírujte `.env.example` do `.env` a nastavte potřebné proměnné.

Spuštění venue-service:

```bash
npm run dev --workspace @sportslot/venue-service
```

Spuštění API Gateway v dalším terminálu:

```bash
npm run dev --workspace @sportslot/gateway
```

Kontrola dostupnosti:

`GET http://localhost:4002/health`

## Testing

Automatické testy používají Node.js test runner, Supertest a mock databáze.

```bash
npm test --workspace @sportslot/venue-service
npm run lint --workspace @sportslot/venue-service
```

Aktuální sada obsahuje 17 testů pokrývajících health check a scénáře obou court endpointů.

Mock testy nevyžadují spojení se Supabase a nevytvářejí skutečné záznamy v databázi.

Samostatně bylo ručně ověřeno:

- Načtení skutečných kurtů ze Supabase přes Gateway.
- Odmítnutí neautentizovaného volání `court/create`.
- Vytvoření kurtu přes autorizovaný požadavek v Postmanu.
- Ověření nového záznamu v Supabase Table Editoru.

Testovací záznamy ve sdílené databázi je nutné po ověření odstranit.

## Related documentation

- `docs/api.md` – společná specifikace API a formátu chyb.
- `gateway/README.md` – JWT autentizace, autorizace a proxy směrování.
- `db/README.md` – PostgreSQL, Prisma, migrace a seed data.

## Known limitations

- `pageSize` aktuálně nemá definovanou maximální hodnotu.
- Automatické testy používají mock Prisma Client; plnohodnotné databázové integrační testy nejsou součástí této sady.
- Před nasazením je nutné dokončit související bezpečnostní a provozní nastavení mikroslužeb.

Implementované endpointy nejsou samy o sobě potvrzením produkční připravenosti celého systému.