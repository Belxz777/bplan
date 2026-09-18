import { and, eq, ne, or, sql } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { signAccessToken } from "../encrypt/jwt";
import { isSelfOrLevel, requireAuth } from "../middleware/auth";
import { clearAccessTokenCookie, setAccessTokenCookie } from "../encrypt/cookie";

const LEVELS = [1, 2, 3] as const;
const MAX_LEVEL = 3; // высший уровень доступа — аналог "admin" из старой логики

// колонки, безопасные для отдачи наружу (без password_hash)
// формат для relational query API: db.query.users.findFirst({ columns: {...} })
const PUBLIC_COLUMNS = {
  id: true,
  email: true,
  username: true,
  level: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

// формат для core query builder: .insert(...).returning({...}) / .update(...).returning({...})
// тут нужны ссылки на реальные колонки, а не { field: true }
const PUBLIC_RETURNING = {
  id: users.id,
  email: users.email,
  username: users.username,
  level: users.level,
  lastLoginAt: users.lastLoginAt,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}

export const userRoutes = {
  "/api/users": {
    // список всех пользователей — только для уровня MAX_LEVEL
    GET: requireAuth(
      async () => {
        const rows = await db.query.users.findMany({
          orderBy: (u, { desc }) => desc(u.id),
          columns: PUBLIC_COLUMNS,
        });

        return Response.json(rows);
      },
      { minLevel: MAX_LEVEL },
    ),

    // регистрация — публичный эндпоинт, выдаёт токен сразу
    async POST(req: Request) {
      const body = await req.json();
      const { email, username, password, level } = body;

      if (!email || !username || !password) {
        return Response.json(
          { error: "email, username and password are required" },
          { status: 400 },
        );
      }

      if (String(password).length < 8) {
        return Response.json(
          { error: "password must be at least 8 characters" },
          { status: 400 },
        );
      }

      if (level !== undefined && !LEVELS.includes(level)) {
        return Response.json(
          { error: `level must be one of: ${LEVELS.join(", ")}` },
          { status: 400 },
        );
      }

      const duplicate = await db.query.users.findFirst({
        where: or(eq(users.email, email), eq(users.username, username)),
      });

      if (duplicate) {
        return Response.json(
          { error: "User with this email or username already exists" },
          { status: 409 },
        );
      }

      const [user] = await db
        .insert(users)
        .values({
          email,
          username,
          passwordHash: await Bun.password.hash(password),
          level: level ?? 1,
        })
        .returning(PUBLIC_RETURNING);

      const token = await signAccessToken({ id: user.id, level: user.level });
     const headers = new Headers();

      headers.set("Set-Cookie", setAccessTokenCookie(token));

      return Response.json({ user, token },
         { status: 201,headers });
    },
  },

  "/api/users/:id": {
    // свой профиль — можно смотреть себе, чужой — только уровень MAX_LEVEL
    GET: requireAuth(async (req: Request & { params: { id: string }; user: { id: number; level: number } }) => {
      const id = parseId(req.params.id);
      if (id === null) {
        return Response.json({ error: "Invalid user id" }, { status: 400 });
      }

      if (!isSelfOrLevel(req.user, id, MAX_LEVEL)) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: PUBLIC_COLUMNS,
      });

      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      return Response.json(user);
    }),

    PUT: requireAuth(async (req: Request & { params: { id: string }; user: { id: number; level: number } }) => {
      const id = parseId(req.params.id);
      if (id === null) {
        return Response.json({ error: "Invalid user id" }, { status: 400 });
      }

      if (!isSelfOrLevel(req.user, id, MAX_LEVEL)) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }

      const body = await req.json();
      const { email, username, password, level } = body;

      // менять level может только пользователь уровня MAX_LEVEL (и не себе — опционально)
      if (level !== undefined && req.user.level < MAX_LEVEL) {
        return Response.json(
          { error: "Only a level 3 user can change level" },
          { status: 403 },
        );
      }

      const existing = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (!existing) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      if (level !== undefined && !LEVELS.includes(level)) {
        return Response.json(
          { error: `level must be one of: ${LEVELS.join(", ")}` },
          { status: 400 },
        );
      }

      if (email || username) {
        const duplicate = await db.query.users.findFirst({
          where: and(
            or(eq(users.email, email ?? ""), eq(users.username, username ?? "")),
            ne(users.id, id),
          ),
        });

        if (duplicate) {
          return Response.json(
            { error: "Email or username already taken" },
            { status: 409 },
          );
        }
      }

      const passwordHash = password
        ? await Bun.password.hash(password)
        : undefined;

      const [user] = await db
        .update(users)
        .set({
          email,
          username,
          passwordHash,
          level,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(users.id, id))
        .returning(PUBLIC_RETURNING);

      return Response.json(user);
    }),

    DELETE: requireAuth(
      async (req: Request & { params: { id: string }; user: { id: number; level: number } }) => {
        const id = parseId(req.params.id);
        if (id === null) {
          return Response.json({ error: "Invalid user id" }, { status: 400 });
        }

        const [{ count: topLevelCount }] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(users)
          .where(eq(users.level, MAX_LEVEL));

        const target = await db.query.users.findFirst({
          where: eq(users.id, id),
          columns: { level: true },
        });

        if (!target) {
          return Response.json({ error: "User not found" }, { status: 404 });
        }

        if (target.level === MAX_LEVEL && topLevelCount <= 1) {
          return Response.json(
            { error: `Cannot delete the last level ${MAX_LEVEL} user` },
            { status: 409 },
          );
        }

        await db.delete(users).where(eq(users.id, id));

        return Response.json({ success: true, message: "User deleted" });
      },
      { minLevel: MAX_LEVEL },
    ),
  },

  "/api/auth/login": {
    async POST(req: Request) {
      const body = await req.json();
      const { login, password } = body;

      if (!login || !password) {
        return Response.json(
          { error: "login and password are required" },
          { status: 400 },
        );
      }

      const user = await db.query.users.findFirst({
        where: or(eq(users.email, login), eq(users.username, login)),
      });

      if (!user || !(await Bun.password.verify(password, user.passwordHash))) {
        return Response.json({ error: "Invalid credentials" }, { status: 401 });
      }

      await db
        .update(users)
        .set({ lastLoginAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(users.id, user.id));

      const { passwordHash, ...safe } = user;
      const token = await signAccessToken({ id: user.id, level: user.level });
     const headers = new Headers();

    headers.set("Set-Cookie", setAccessTokenCookie(token));

      return Response.json({
         user: safe, token 
        },
         {
    status: 201,
    headers,
         }
      );
    },
  },
  "/api/auth/logout": {
  async POST() {
    const headers = new Headers();

    headers.set(
      "Set-Cookie",
      clearAccessTokenCookie(),
    );

    return Response.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      {
        headers,
      },
    );
  },
},  
};