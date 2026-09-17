// Чистые функции — никакого I/O, никакой БД, никаких Request/Response.
// Именно это делает их удобными для unit-тестов: один и тот же вход
// всегда даёт один и тот же выход, и тест выполняется мгновенно.

export const ROLES = ["admin", "manager", "user"] as const;
export const STATUSES = ["active", "inactive", "banned"] as const;
export const LEVELS = [
  "intern",
  "junior",
  "middle",
  "senior",
  "lead",
  "head",
] as const;

export type Role = (typeof ROLES)[number];
export type UserStatus = (typeof STATUSES)[number];
export type PositionLevel = (typeof LEVELS)[number];

export function isValidRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isValidStatus(value: unknown): value is UserStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export function isValidLevel(value: unknown): value is PositionLevel {
  return typeof value === "string" && (LEVELS as readonly string[]).includes(value);
}

export function isValidPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 8;
}

// Number("") === 0 и Number(" ") === 0 — частые ловушки.
// Явно проверяем, что строка не пустая и результат — целое число.
export function parseId(raw: string): number | null {
  if (raw.trim() === "") return null;
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}
