import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { createTestDb } from "./helpers/testDb";
import { createUserRoutes } from "../src/api/routes/users";

// --- Чем e2e отличается от интеграционного теста выше: ---
// Там мы вызывали routes["/api/users"].POST(...) напрямую — в обход сети.
// Здесь запрос идёт через настоящий TCP-сокет, с настоящей сериализацией
// JSON, настоящими заголовками. Это самый медленный, но самый честный
// уровень: он проверяет ровно то, что увидит реальный клиент.

let server: ReturnType<typeof Bun.serve>;
let baseUrl: string;

beforeAll(() => {
  const db = createTestDb();
  const routes = createUserRoutes(db);

  // port: 0 — ОС сама выберет свободный порт, тесты не конфликтуют
  // друг с другом при параллельном запуске.
  server = Bun.serve({ port: 0, routes });
  baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
  server.stop();
});

describe("E2E: полный цикл создания пользователя по HTTP", () => {
  it("создаёт пользователя, затем находит его по id", async () => {
    const createRes = await fetch(`${baseUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "e2e@test.com",
        username: "e2e_user",
        password: "password123",
      }),
    });

    expect(createRes.status).toBe(201);
    expect(createRes.headers.get("content-type")).toContain("application/json");

    const created = await createRes.json();
    expect(created.id).toBeGreaterThan(0);

    const getRes = await fetch(`${baseUrl}/api/users/${created.id}`);
    expect(getRes.status).toBe(200);

    const fetched = await getRes.json();
    expect(fetched.email).toBe("e2e@test.com");
  });

  it("возвращает 404 по-настоящему через сеть, а не только в коде обработчика", async () => {
    const res = await fetch(`${baseUrl}/api/users/999999`);
    expect(res.status).toBe(404);
  });
});
