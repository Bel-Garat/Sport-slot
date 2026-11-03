export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type Role = "PLAYER" | "MANAGER" | "ADMIN";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
};

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

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const mockRole = process.env.NEXT_PUBLIC_MOCK_ROLE;
  if (mockRole) {
    return Object.hasOwn(mockUsers, mockRole) ? mockUsers[mockRole] : null;
  }

  const response = await fetch(`${apiBaseUrl}/user/me`, {
    credentials: "include",
  });
  if (response.status === 401) {
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
