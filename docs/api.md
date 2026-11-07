# Specifikace API (SportSlot)

Tento dokument obsahuje seznam endpointů, které zajišťuje `venue-service` (správa sportovišť a kurtů). 
Gateway předává požadavky této službě po ověření uživatele v `auth-service`.

## 0. Formát odpovědí a chyb

Platí pro gateway i všechny mikroslužby. Vychází ze šablony commandu v Command listu (uuApp). Implementace je v balíčku `packages/api-format` (`@sportslot/api-format`).

### Úspěšná odpověď
HTTP 200, tělo = dtoOut a vždy klíč `uuAppErrorMap` (bez varování prázdný `{}`).

```json
{ "id": "…", "name": "Tenisový areál Lužánky", "uuAppErrorMap": {} }
```

Seznamy vracejí `itemList` a `pageInfo` (výchozí `pageSize` je 20):

```json
{ "itemList": [ … ], "pageInfo": { "pageIndex": 0, "pageSize": 20, "total": 42 }, "uuAppErrorMap": {} }
```

### Chyba
Tělo obsahuje jen `uuAppErrorMap`. Klíč je `{command}/{kódChyby}`, např. `venue/get/venueDoesNotExist`. `message` je česky, aby ji frontend mohl rovnou zobrazit. `paramMap` nese podrobnosti (může být `{}`).

```json
{
  "uuAppErrorMap": {
    "venue/get/venueDoesNotExist": {
      "type": "error",
      "message": "Sportoviště nenalezeno.",
      "paramMap": { "id": "…" }
    }
  }
}
```

### Varování
Požadavek projde (HTTP 200), varování je v `uuAppErrorMap` s `"type": "warning"`. Jediné společné varování je `unsupportedKeys`: dtoIn obsahuje klíče, které command nezná, a ty se ignorují. `paramMap`: `{ "unsupportedKeyList": ["foo"] }`.

### HTTP statusy a kódy chyb

| HTTP | Kód chyby | Kdy | Zpráva |
|---|---|---|---|
| 400 | `invalidDtoIn` | dtoIn neprošel validací nebo tělo není platný JSON. `paramMap`: `invalidTypeKeyMap`, `invalidValueKeyMap`, `missingKeyMap` | Vstupní data nejsou platná. |
| 401 | `notAuthenticated` | Command vyžaduje přihlášení a uživatel přihlášený není. | Nejste přihlášen. |
| 403 | `notAuthorized` | Uživatel nemá potřebnou roli nebo není vlastníkem (např. cizí sportoviště). | Nemáte oprávnění. |
| 404 | `{entita}DoesNotExist` | Záznam neexistuje, např. `venue/get/venueDoesNotExist`. | Např. Sportoviště nenalezeno. |
| 404 | `unknownCommand` | Neexistující URL. | Neznámý příkaz. |
| 409 | `{entita}AlreadyExists` | Porušení jedinečnosti, např. `venue/create/venueAlreadyExists`, `court/create/courtAlreadyExists`. | Např. Kurt s tímto názvem už existuje. |
| 500 | `unexpectedError` | Neočekávaná chyba serveru. Podrobnosti jen v logu služby, nikdy v odpovědi. | Neočekávaná chyba serveru. |

Kódy chyb jsou anglicky v camelCase. Každý command uvádí své konkrétní chyby v sekci **Seznam chyb** v Command listu.

### Použití v mikroslužbě

```js
import { AppError, invalidDtoIn, unsupportedKeys } from '@sportslot/api-format'

app.get('/venue/get', async (req, res) => {
	if (!req.query.id) throw invalidDtoIn({ missingKeyMap: { id: 'Klíč id je povinný.' } })
	const venue = await venueDao.get(req.query.id)
	if (!venue) throw new AppError('venueDoesNotExist', 'Sportoviště nenalezeno.', 404, { id: req.query.id })
	res.json({ ...venue, uuAppErrorMap: unsupportedKeys(req, req.query, ['id']) })
})
```

Command (`venue/get`) se do klíče doplní automaticky z URL. `app.use(notFound)` a `app.use(errorHandler)` jsou už zapojené v `app.js` každé služby i gateway; nové routy se přidávají **před** ně. Express 5 předá vyhozenou chybu do `errorHandler` i z `async` funkce. Pro 401 a 403 jsou připravené `notAuthenticated()` a `notAuthorized()`.

### Frontend
Když `response.ok` je `false`, zobrazte `message` první položky v `uuAppErrorMap`. Pro konkrétní chování (např. přesměrování na přihlášení při 401) rozhodujte podle HTTP statusu nebo podle konce klíče (`…/notAuthenticated`), ne podle textu zprávy.

## 1. Sportoviště (Venue)

### `POST venue/create`
* **Popis:** Založení nového sportoviště (US 3, BUC 1).
* **Práva:** Oprávnění Správce.
* **Tělo požadavku (JSON):** `name`, `address`, `city`, `description`.
* **Poznámka:** Založí se také záznamy do tabulky `OpeningHours` (den, od-do).

### `GET venue/list`
* **Popis:** Vyhledání sportovišť podle sportu a města (US 6, BUC 3).
* **Práva:** Návštěvník (nepřihlášený) i Hráč.
* **Poznámka:** Vrací jen sportoviště, která mají alespoň jeden kurt.

### `GET venue/get`
* **Popis:** Detail konkrétního sportoviště (US 6, BUC 3).
* **Práva:** Návštěvník i Hráč.

## 2. Kurty (Court)

### `POST court/create`
* **Popis:** Přidání nového kurtu pod existující sportoviště (US 4, BUC 2).
* **Práva:** Správce (musí být vlastníkem sportoviště).
* **Tělo požadavku (JSON):** `venueId`, `name`, `sport`, `surface`, `indoor` (boolean).

### `GET court/list`
* **Popis:** Získání seznamu všech kurtů daného sportoviště (US 5).
* **Práva:** Návštěvník i Hráč.

## 3. Ceníky a pravidla (PriceRule)

### `POST priceRule/create`
* **Popis:** Vytvoření cenového pravidla pro konkrétní kurt (US 7).
* **Práva:** Správce.
* **Tělo požadavku (JSON):** `courtId`, `dayOfWeek`, `startTime`, `endTime`, `pricePerHour`.

### `GET priceRule/listByCourt`
**Popis:** Získání ceníku kurtu. Tento endpoint bude volat `reservation-service` pro výpočet výsledné ceny rezervace (US 7). 
## 4. Auth – Google přihlášení (návrh API kontraktu)

### POST /api/auth/googleCallback

**Popis:** Přihlášení uživatele pomocí Google účtu. Backend ověří Google ID token, vyhledá nebo vytvoří uživatele a vrátí JWT token aplikace.

**Autentizace:** Není vyžadována.

**dtoIn:**
```json
{
  "idToken": "google-id-token"
}
```

**dtoOut (200):**
```json
{
  "token": "application-jwt-token",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "Test User",
    "roles": ["PLAYER"]
  },
  "uuAppErrorMap": {}
}
```

**Možné chyby:**
- 400 – invalidDtoIn
- 401 – neplatný Google token
- 500 – interní chyba serveru

---

## 5. User – Informace o přihlášeném uživateli (návrh API kontraktu)


### GET /api/user/me

**Popis:** Vrátí informace o aktuálně přihlášeném uživateli.

**Autentizace:** Vyžadován JWT token aplikace.

**HTTP hlavička:**
```text
Authorization: Bearer <JWT_TOKEN>
```

**dtoIn:** Žádné vstupní parametry.

**dtoOut (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "Test User",
  "roles": ["PLAYER"],
  "uuAppErrorMap": {}
}
```

**Možné chyby:**
- 401 – notAuthenticated
- 404 – uživatel nebyl nalezen
- 500 – interní chyba serveru

**Poznámka:** Endpoint /api/user/me vyžaduje doplnění směrování v gateway a implementaci v backendové službě.
