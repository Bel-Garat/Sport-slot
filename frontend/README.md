# Frontend

Frontend aplikace v Next.js.
## Spuštění

```bash
npm install          # v kořeni repozitáře (npm workspaces)
npm run dev:frontend # http://localhost:3000
```

Adresu API gateway čte aplikace z `NEXT_PUBLIC_API_URL` (viz `.env.example`).
Styling zatím není zvolený – čeká na týmovou dohodu.

## Přihlášení a ochrana stránek podle role

Vše je podle auth kontraktu: JWT v hlavičce `Authorization: Bearer <token>`, token v localStorage, žádné cookies.

| Kde | Co tam je |
|---|---|
| `src/lib/api.ts` | `getToken()`, `setToken()`, `clearToken()`, `authHeaders()`, `getCurrentUser()` (volá `GET /api/user/me`), mock uživatelé |
| `src/lib/auth.tsx` | `AuthProvider`, `useAuth()` → `{ user, loading, signIn }`, `logout()`, `safeNextPath()`, `loginPath` |
| `src/components/RequireRole.tsx` | ochrana stránky podle role |
| `src/components/NoPermission.tsx` | hláška „Nemáte oprávnění“ |

### Chráněná stránka

```tsx
<RequireRole roles={["MANAGER"]}>…obsah stránky…</RequireRole>
```

Bez `roles` stačí libovolný přihlášený uživatel. Nepřihlášený je přesměrován na `/login?next=<aktuální stránka>`, přihlášený bez role vidí „Nemáte oprávnění“. Vyhledávání a detail sportoviště jsou veřejné – ty neobalujte.

### Volání chráněného endpointu

```ts
fetch(`${apiBaseUrl}/venue/create`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...authHeaders() },
  body: JSON.stringify(venue),
});
```

### Přihlašovací stránka `/login`

1. Tlačítko „Přihlásit se přes Google“ vrátí Google `credential`.
2. `POST /api/auth/googleCallback` s `{ credential }` vrátí `{ token, user }`.
3. `signIn(odpověď)` z `useAuth()` uloží token i uživatele.
4. `router.replace(safeNextPath(next))` – parametr `next` čtěte přes `useSearchParams()` a stránku obalte do `<Suspense>`, jinak `next build` selže. Nikdy nepřesměrovávejte přímo na hodnotu `next`.

### Odhlášení

`logout()` z `@/lib/auth` – smaže token a načte úvodní stránku. Backend žádné odhlášení nemá.

### Mock uživatel pro lokální vývoj

Dokud neběží auth-service, lze použít mock uživatele (`visitor`, `player`, `manager`, `admin`):

```bash
NEXT_PUBLIC_MOCK_ROLE=manager npm run dev:frontend
```

`NEXT_PUBLIC_MOCK_ROLE` je jen pro lokální vývoj – nikdy ho nenastavujte na Netlify. Hodnota se vkládá do buildu, takže by se tam každý návštěvník stal mock uživatelem.

### Bezpečnost

`RequireRole` je jen UX, ne bezpečnostní hranice: obsah serverových komponent uvnitř je i tak v HTML stránky. Citlivá data načítejte až v klientské komponentě po přihlášení – oprávnění vždy ověřuje gateway a služby.
