# Frontend

Frontend aplikace v Next.js.
## Spuštění

```bash
npm install          # v kořeni repozitáře (npm workspaces)
npm run dev:frontend # http://localhost:3000
```

Adresu API gateway čte aplikace z `NEXT_PUBLIC_API_URL` (viz `.env.example`).
Styling je v [Tailwind CSS v4](https://tailwindcss.com/docs) (dohodnuto v týmu 4. 11. 2026). Třídy pište přímo do `className`, `globals.css` obsahuje jen `@import "tailwindcss";`. Konfigurační soubor `tailwind.config` v4 nepotřebuje, vlastní hodnoty patří do bloku `@theme` v `globals.css`.

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
