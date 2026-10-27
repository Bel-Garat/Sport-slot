# SportSlot 

## Pravidla pro větve
* Nové funkce vyvíjíme ve větvích s prefixem: `feature/<nazev-ukolu>`
* Opravy chyb: `bugfix/<nazev-chyby>`

## Pravidla pro commity
Každá commit zpráva musí začínat jedním z následujících prefixů podle toho, co přesně mění:
* **feat:** Přidání nové funkcionality (např. `feat: založení endpointu pro kurty`)
* **fix:** Oprava chyby (např. `fix: oprava padání vyhledávání`)
* **refactor:** Úprava struktury kódu bez změny chování (např. `refactor: přepsání komponenty detailu`)
* **chore:** Pomocné práce, konfigurace, úprava dokumentace (např. `chore: aktualizace README`)

## Jak otevřít Pull Request (PR)
1. Pushněte svou branch na GitHub.
2. Otevřete PR proti větvi `main`.
3. Vyplňte automatickou šablonu.
4. Před mergem musí PR schválit minimálně 1 další člen týmu.

## Lokální vývoj
Potřebujete Node.js 22 (`.nvmrc`). Repozitář používá npm workspaces – závislosti se instalují jednou v kořeni.

```bash
npm install
npm run dev:frontend   # Next.js na http://localhost:3000
npm run dev:gateway    # API gateway na http://localhost:4000
npm run dev --workspace services/venue-service   # jednotlivá služba (porty 4001–4005)
```

| Část | Složka | Port |
|---|---|---|
| Frontend (Next.js) | `frontend/` | 3000 |
| API gateway | `gateway/` | 4000 |
| auth-service | `services/auth-service/` | 4001 |
| venue-service | `services/venue-service/` | 4002 |
| reservation-service | `services/reservation-service/` | 4003 |
| review-service | `services/review-service/` | 4004 |
| audit-service | `services/audit-service/` | 4005 |

Proměnné prostředí jsou popsané v `.env.example`.

## Kontroly (CI)
Každý PR do `main` spouští GitHub Actions (`.github/workflows/ci.yml`):
* název větve `feature/…` nebo `bugfix/…`,
* commit zprávy s prefixem `feat:`, `fix:`, `refactor:` nebo `chore:`,
* `npm run lint`, `npm test` a `npm run build` ve všech částech.

Stejné kontroly spustíte lokálně příkazy `npm run lint`, `npm test` a `npm run build`.
