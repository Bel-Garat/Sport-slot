# Frontend

Frontend aplikace v Next.js.
## Spuštění

```bash
npm install          # v kořeni repozitáře (npm workspaces)
npm run dev:frontend # http://localhost:3000
```

Adresu API gateway čte aplikace z `NEXT_PUBLIC_API_URL` (viz `.env.example`).
Styling je v [Tailwind CSS v4](https://tailwindcss.com/docs) (dohodnuto v týmu 4. 11. 2026). Třídy pište přímo do `className`, `globals.css` obsahuje jen `@import "tailwindcss";`. Konfigurační soubor `tailwind.config` v4 nepotřebuje, vlastní hodnoty patří do bloku `@theme` v `globals.css`.

### Brand

- Barvy jsou v `@theme` v `globals.css`: `brand-50` až `brand-900` (zelená kurtu), `ball` (žlutozelená tenisového míčku, jen na akcenty a hlavní CTA), `ink-500` a `ink-900` pro text. Používejte je místo výchozí palety Tailwindu (`text-brand-900`, `bg-ball`…).
- Písma: `font-display` (Bricolage Grotesque) na nadpisy, `font-sans` (Inter) na text. Načítá je `next/font` v `layout.tsx`.
- Logo: `<Logo />` (značka + název, odkaz na úvod) a `<LogoMark />` (jen značka) v `src/components/Logo.tsx`, favicon je `src/app/icon.svg`.
- Hlavička (`SiteHeader`) a patička (`SiteFooter`) jsou v root layoutu. Přihlášení a avatar patří do pravé části hlavičky.

## Ochrana stránek podle role

Stránku chráníte obalením obsahu komponentou `RequireRole`:

```tsx
<RequireRole roles={["MANAGER"]}>…</RequireRole>
```

Bez `roles` stačí libovolný přihlášený uživatel. Nepřihlášený uživatel je přesměrován na `/login?next=<aktuální cesta>`, přihlášený bez potřebné role vidí „Nemáte oprávnění“.

Dokud není hotové `user/me`, lze použít mock uživatele (`visitor`, `player`, `manager`, `admin`):

```bash
NEXT_PUBLIC_MOCK_ROLE=manager npm run dev:frontend
```

`NEXT_PUBLIC_MOCK_ROLE` je jen pro lokální vývoj – nikdy ho nenastavujte na Netlify. Hodnota se vkládá do buildu, takže by se tam každý návštěvník stal mock uživatelem.

Stránka `/login` čte parametr `next` přes `useSearchParams()` (stránka musí být obalená v `<Suspense>`, jinak `next build` selže), po přihlášení zavolá `setUser(user)` z `useAuth()` a přesměruje na `safeNextPath(next)` z `@/lib/auth` – nikdy přímo na hodnotu `next`.

Odhlášení zavolá odhlášení na backendu a pak `window.location.assign("/")`. Samotné `setUser(null)` na chráněné stránce by přesměrovalo na přihlášení s `next` na tuto stránku.

`RequireRole` je jen UX, ne bezpečnostní hranice: obsah serverových komponent uvnitř je i tak v HTML stránky. Citlivá data načítejte až v klientské komponentě po přihlášení – oprávnění vždy ověřuje backend.

## Založení sportoviště

Formulář je na `/venues/new` (jen role `MANAGER`). Volá `createVenue()` z `@/lib/api`, tedy `POST /api/venue/create`. S nastaveným `NEXT_PUBLIC_MOCK_ROLE` místo API použije mock: sportoviště drží v paměti prohlížeče a druhé se stejným názvem, adresou a městem odmítne chybou `venue/create/venueAlreadyExists` (409).

Předpokládaný dtoIn (dokud není hotová dokumentace API v Command listu):

```json
{
  "name": "Sportcentrum Lužánky",
  "address": "Lidická 1",
  "city": "Brno",
  "description": "…",
  "openingHoursList": [{ "dayOfWeek": 1, "openTime": "08:00", "closeTime": "22:00" }]
}
```

`dayOfWeek` je 1 = pondělí až 7 = neděle, zavřené dny v seznamu nejsou.
