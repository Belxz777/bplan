import { describe, it, expect, beforeEach } from "bun:test";
import type { Database } from "bun:sqlite";
import { createTestDb } from "./helpers/testDb";
import { createUserRoutes } from "../src/api/routes/users";

// --- Что проверяем в интеграционных тестах: ---
// 1. Код ответа (200/201/400/404/409) — контракт с клиентом.
// 2. Форму тела ответа — те ли поля, того ли типа.
// 3. Реальные последствия в БД — действительно ли строка создалась/изменилась.
// 4. Инварианты безопасности — например, password_hash никогда не в ответе.
// 5. Порядок операций — валидация ДО записи в БД (невалидный запрос
//    не должен ничего менять).

let db: Database;
let routes: ReturnType<typeof createUserRoutes>;

// beforeEach — свежая БД перед КАЖДЫМ тестом. Без этого тест B мог бы
// пройти только потому, что тест A перед ним что-то создал — ложная
// уверенность, которая ломается при запуске тестов по одному.
beforeEach(() => {
  db = createTestDb();
  routes = createUserRoutes(db);
});

function postRequest(body: object): Request {
  return new Request("http://localhost/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function fakeParamsRequest(id: string) {
  // GET/DELETE в этом коде не читают тело — им достаточно params.
  // Реальный Request здесь не нужен, это осознанное упрощение
  // на уровне "тестируем обработчик", а не "тестируем HTTP".
  return { params: { id } } as Request & { params: { id: string } };
}

describe("POST /api/users", () => {
  it("создаёт пользователя при валидных данных", async () => {
    const res = await routes["/api/users"].POST(
      postRequest({ email: "a@b.com", username: "alice", password: "password123" }),
    );

    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.email).toBe("a@b.com");
    expect(body.role).toBe("user"); // дефолт применился
    expect(body).not.toHaveProperty("password_hash"); // секрет не утёк
  });

  it("отклоняет запрос без обязательных полей", async () => {
    const res = await routes["/api/users"].POST(postRequest({ email: "a@b.com" }));
    expect(res.status).toBe(400);

    // и главное — ничего не должно было записаться в БД
    const count = db.query(`SELECT COUNT(*) AS c FROM users`).get() as { c: number };
    expect(count.c).toBe(0);
  });

  it("отклоняет короткий пароль", async () => {
    const res = await routes["/api/users"].POST(
      postRequest({ email: "a@b.com", username: "alice", password: "short" }),
    );
    expect(res.status).toBe(400);
  });

  it("отклоняет неизвестную роль", async () => {
    const res = await routes["/api/users"].POST(
      postRequest({ email: "a@b.com", username: "alice", password: "password123", role: "superadmin" }),
    );
    expect(res.status).toBe(400);
  });

  it("отклоняет дублирующийся email", async () => {
    await routes["/api/users"].POST(
      postRequest({ email: "a@b.com", username: "alice", password: "password123" }),
    );

    const res = await routes["/api/users"].POST(
      postRequest({ email: "a@b.com", username: "bob", password: "password123" }),
    );

    expect(res.status).toBe(409);
  });

  it("хэширует пароль — в БД не лежит открытый текст", async () => {
    await routes["/api/users"].POST(
      postRequest({ email: "a@b.com", username: "alice", password: "password123" }),
    );

    const row = db
      .query(`SELECT password_hash FROM users WHERE email = ?`)
      .get("a@b.com") as { password_hash: string };

    expect(row.password_hash).not.toBe("password123");
    expect(row.password_hash.length).toBeGreaterThan(20);
  });

  it("возвращает 404, если position_id указывает на несуществующую позицию", async () => {
    const res = await routes["/api/users"].POST(
      postRequest({
        email: "a@b.com",
        username: "alice",
        password: "password123",
        position_id: 999,
      }),
    );
    expect(res.status).toBe(404);
  });
});

describe("GET /api/users/:id", () => {
  it("возвращает 404 для несуществующего пользователя", () => {
    const res = routes["/api/users/:id"].GET(fakeParamsRequest("999"));
    expect(res.status).toBe(404);
  });

  it("возвращает 400 для нечислового id", () => {
    const res = routes["/api/users/:id"].GET(fakeParamsRequest("abc"));
    expect(res.status).toBe(400);
  });

  it("находит существующего пользователя", async () => {
    const created = await (
      await routes["/api/users"].POST(
        postRequest({ email: "a@b.com", username: "alice", password: "password123" }),
      )
    ).json();

    const res = routes["/api/users/:id"].GET(fakeParamsRequest(String(created.id)));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.username).toBe("alice");
  });
});

describe("DELETE /api/users/:id — защита последнего админа", () => {
  it("не даёт удалить единственного админа", async () => {
    const admin = await (
      await routes["/api/users"].POST(
        postRequest({ email: "admin@x.com", username: "admin", password: "password123", role: "admin" }),
      )
    ).json();

    const res = routes["/api/users/:id"].DELETE(fakeParamsRequest(String(admin.id)));
    expect(res.status).toBe(409);

    // и он правда остался в базе
    const stillThere = db.query(`SELECT id FROM users WHERE id = ?`).get(admin.id);
    expect(stillThere).not.toBeNull();
  });

  it("разрешает удалить админа, если есть ещё один", async () => {
    const admin1 = await (
      await routes["/api/users"].POST(
        postRequest({ email: "a1@x.com", username: "admin1", password: "password123", role: "admin" }),
      )
    ).json();

    await routes["/api/users"].POST(
      postRequest({ email: "a2@x.com", username: "admin2", password: "password123", role: "admin" }),
    );

    const res = routes["/api/users/:id"].DELETE(fakeParamsRequest(String(admin1.id)));
    expect(res.status).toBe(200);
  });

  it("обычного пользователя можно удалить без ограничений", async () => {
    const user = await (
      await routes["/api/users"].POST(
        postRequest({ email: "u@x.com", username: "user1", password: "password123" }),
      )
    ).json();

    const res = routes["/api/users/:id"].DELETE(fakeParamsRequest(String(user.id)));
    expect(res.status).toBe(200);
  });
});
