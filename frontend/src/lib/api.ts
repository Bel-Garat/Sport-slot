export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Role uživatele – stejné hodnoty jako enum `Role` v `db/prisma/schema.prisma`. */
export type Role = "PLAYER" | "MANAGER" | "ADMIN";

/** Přihlášený uživatel – objekt `user` z odpovědi `auth/googleCallback` a `user/me` (auth kontrakt). */
export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
};

/** Odpověď `POST /api/auth/googleCallback` podle auth kontraktu. */
export type SignInResponse = {
  token: string;
  user: CurrentUser;
};

// Auth kontrakt: JWT z auth-service ukládá frontend do localStorage pod tímto klíčem
// a posílá ho v hlavičce `Authorization: Bearer <token>`. Cookies nepoužíváme.
const tokenStorageKey = "sportslot.token";

/** Uložený JWT, nebo `null`, když nikdo není přihlášený (nebo běží na serveru). */
export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(tokenStorageKey);
  } catch {
    return null;
  }
}

/** Uloží JWT po přihlášení. Na přihlašovací stránce volejte `signIn()` z `useAuth()`, které to udělá samo. */
export function setToken(token: string): void {
  window.localStorage.setItem(tokenStorageKey, token);
}

/** Smaže JWT – při odhlášení (`logout()` v `lib/auth.tsx`) nebo když ho backend odmítne (401). */
export function clearToken(): void {
  try {
    window.localStorage.removeItem(tokenStorageKey);
  } catch {
    // localStorage nemusí být dostupné (např. anonymní okno) – pak není co mazat.
  }
}

/**
 * Hlavička s tokenem pro chráněné endpointy. Bez přihlášení vrátí `{}`.
 *
 * Příklad (formulář sportoviště):
 *   fetch(`${apiBaseUrl}/venue/create`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json", ...authHeaders() },
 *     body: JSON.stringify(venue),
 *   });
 */
export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Mock uživatelé pro lokální vývoj, dokud neběží auth-service.
// Zapnou se proměnnou NEXT_PUBLIC_MOCK_ROLE=visitor|player|manager|admin (nikdy ne na Netlify).
const mockUsers: Record<string, CurrentUser | null> = {
  visitor: null,
  player: {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Petr Hráč",
    email: "player@example.com",
    roles: ["PLAYER"],
  },
  manager: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Marie Správcová",
    email: "manager@example.com",
    roles: ["PLAYER", "MANAGER"],
  },
  admin: {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Adam Administrátor",
    email: "admin@example.com",
    roles: ["PLAYER", "ADMIN"],
  },
};

/**
 * Zjistí přihlášeného uživatele. Volá ho `AuthProvider` jednou při načtení stránky.
 * - `NEXT_PUBLIC_MOCK_ROLE` nastavené → vrátí mock uživatele (jen lokální vývoj);
 * - bez tokenu → `null` bez volání API (nepřihlášený návštěvník);
 * - jinak `GET /api/user/me` s tokenem; 401 = token vypršel (platí 24 h) nebo je neplatný → smaže ho a vrátí `null`.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const mockRole = process.env.NEXT_PUBLIC_MOCK_ROLE;
  if (mockRole) {
    return Object.hasOwn(mockUsers, mockRole) ? mockUsers[mockRole] : null;
  }

  if (!getToken()) {
    return null;
  }

  const response = await fetch(`${apiBaseUrl}/user/me`, {
    headers: authHeaders(),
  });
  if (response.status === 401) {
    clearToken();
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET /user/me failed with status ${response.status}`);
  }
  const user = (await response.json()) as CurrentUser;
  if (!Array.isArray(user?.roles)) {
    throw new Error("GET /user/me returned a user without roles");
  }
  return user;
}
