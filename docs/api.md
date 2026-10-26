# Specifikace API (SportSlot)

Tento dokument obsahuje seznam endpointů, které zajišťuje `venue-service` (správa sportovišť a kurtů). 
Gateway předává požadavky této službě po ověření uživatele v `auth-service`.

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
* **Popis:** Získání ceníku kurtu. Tento endpoint bude volat `reservation-service` pro výpočet výsledné ceny rezervace (US 7).