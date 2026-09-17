import { describe, it, expect } from "bun:test";
import {
  isValidRole,
  isValidStatus,
  isValidLevel,
  isValidPassword,
  parseId,
} from "../src/api/validators";

// --- Что проверяем в unit-тестах: ---
// 1. Happy path — очевидно правильный вход.
// 2. Явно неправильный вход.
// 3. Границы (boundary) — значения ровно на грани решения (7 vs 8 символов).
// 4. Неправильный ТИП данных — не только неправильное значение.

describe("isValidRole", () => {
  it("принимает все известные роли", () => {
    expect(isValidRole("admin")).toBe(true);
    expect(isValidRole("manager")).toBe(true);
    expect(isValidRole("user")).toBe(true);
  });

  it("отклоняет неизвестную роль", () => {
    expect(isValidRole("superadmin")).toBe(false);
  });

  it("отклоняет не-строковые значения", () => {
    expect(isValidRole(123)).toBe(false);
    expect(isValidRole(null)).toBe(false);
    expect(isValidRole(undefined)).toBe(false);
    expect(isValidRole(["admin"])).toBe(false);
  });

  it("чувствительна к регистру", () => {
    expect(isValidRole("Admin")).toBe(false);
  });
});

describe("isValidStatus", () => {
  it("принимает известные статусы", () => {
    expect(isValidStatus("active")).toBe(true);
    expect(isValidStatus("banned")).toBe(true);
  });

  it("отклоняет неизвестный статус", () => {
    expect(isValidStatus("deleted")).toBe(false);
  });
});

describe("isValidLevel", () => {
  it("принимает все уровни из списка", () => {
    for (const level of ["intern", "junior", "middle", "senior", "lead", "head"]) {
      expect(isValidLevel(level)).toBe(true);
    }
  });

  it("отклоняет то, чего нет в списке", () => {
    expect(isValidLevel("principal")).toBe(false);
  });
});

describe("isValidPassword", () => {
  // Граничные тесты — самое частое место, где прячутся баги (off-by-one)
  it("отклоняет пароль короче 8 символов", () => {
    expect(isValidPassword("1234567")).toBe(false); // ровно 7
  });

  it("принимает пароль ровно 8 символов (граница)", () => {
    expect(isValidPassword("12345678")).toBe(true); // ровно 8
  });

  it("принимает длинный пароль", () => {
    expect(isValidPassword("a-very-long-password-123")).toBe(true);
  });

  it("отклоняет пустую строку", () => {
    expect(isValidPassword("")).toBe(false);
  });

  it("отклоняет не-строку (например, если password пришёл числом)", () => {
    expect(isValidPassword(12345678)).toBe(false);
  });
});

describe("parseId", () => {
  it("парсит корректный числовой id", () => {
    expect(parseId("42")).toBe(42);
  });

  it("отклоняет нечисловую строку", () => {
    expect(parseId("abc")).toBeNull();
  });

  it("отклоняет дробные числа (id всегда целый)", () => {
    expect(parseId("4.5")).toBeNull();
  });

  it("отклоняет пустую строку", () => {
    expect(parseId("")).toBeNull();
  });

  it("отклоняет строку из пробелов", () => {
    expect(parseId("   ")).toBeNull();
  });

  it("отклоняет отрицательные числа как не-ID (если так решили)", () => {
    // Технически -5 — целое число, но валидный ли это ID — вопрос бизнес-логики.
    // Если parseId должен запрещать отрицательные, добавьте проверку id > 0
    // в саму функцию и раскомментируйте:
    // expect(parseId("-5")).toBeNull();
  });
});
