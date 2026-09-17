import { db } from "../db";

const ROLES = ["admin", "manager", "user"];
const STATUSES = ["active", "inactive", "banned"];

// колонки, безопасные для отдачи наружу (без password_hash)
const PUBLIC_FIELDS = `
  users.id,
  users.email,
  users.username,
  users.full_name,
  users.avatar_url,
  users.position_id,
  users.role,
  users.status,
  users.last_login_at,
  users.created_at,
  users.updated_at
`;

export const userRoutes = {
  "/api/users": {
    GET() {
      const users = db
        .query(`
          SELECT
            ${PUBLIC_FIELDS},
            positions.title AS position_title,
            positions.department AS position_department
          FROM users
          LEFT JOIN positions
            ON positions.id = users.position_id
          ORDER BY users.id DESC
        `)
        .all();

      return Response.json(users);
    },

    async POST(req: Request) {
      const body = await req.json();

      const {
        email,
        username,
        password,
        full_name,
        avatar_url,
        position_id,
        role,
        status,
      } = body;

      if (!email || !username || !password) {
        console.log(body);
        return Response.json(
          { error: "email, username and password are required" },
          { status: 400 },

        );
      }

      if (String(password).length < 8) {
        console.log(body);
        return Response.json(
          { error: "password must be at least 8 characters" },
          { status: 400 },
        );
      }

      if (role && !ROLES.includes(role)) {
        console.log(body);
        return Response.json(
          { error: `role must be one of: ${ROLES.join(", ")}` },
          { status: 400 },
        );
      }

      if (status && !STATUSES.includes(status)) {
            console.log(body);
        return Response.json(
          { error: `status must be one of: ${STATUSES.join(", ")}` },
          { status: 400 },
        );
      }

      const duplicate = db
        .query(`SELECT id FROM users WHERE email = ? OR username = ?`)
        .get(email, username);

      if (duplicate) {
        return Response.json(
          { error: "User with this email or username already exists" },
          { status: 409 },
        );
      }

      if (position_id) {
        const position = db
          .query(`SELECT id FROM positions WHERE id = ?`)
          .get(position_id);

        if (!position) {
          return Response.json(
            { error: "Position not found" },
            { status: 404 },
          );
        }
      }

      const result = db
        .query(`
          INSERT INTO users (
            email, username, password_hash, full_name,
            avatar_url, position_id, role, status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          email,
          username,
          await Bun.password.hash(password),
          full_name ?? null,
          avatar_url ?? null,
          position_id ?? null,
          role ?? "user",
          status ?? "active",
        );

      const user = db
        .query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`)
        .get(result.lastInsertRowid);

      return Response.json(user, { status: 201 });
    },
  },

  "/api/users/:id": {
    GET(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json({ error: "Invalid user id" }, { status: 400 });
      }

      const user = db
        .query(`
          SELECT
            ${PUBLIC_FIELDS},
            positions.title AS position_title,
            positions.department AS position_department
          FROM users
          LEFT JOIN positions
            ON positions.id = users.position_id
          WHERE users.id = ?
        `)
        .get(id);

      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      return Response.json(user);
    },

    async PUT(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json({ error: "Invalid user id" }, { status: 400 });
      }

      const body = await req.json();

      const {
        email,
        username,
        password,
        full_name,
        avatar_url,
        position_id,
        role,
        status,
      } = body;

      const existing = db
        .query(`SELECT id FROM users WHERE id = ?`)
        .get(id);

      if (!existing) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      if (role && !ROLES.includes(role)) {
        return Response.json(
          { error: `role must be one of: ${ROLES.join(", ")}` },
          { status: 400 },
        );
      }

      if (status && !STATUSES.includes(status)) {
        return Response.json(
          { error: `status must be one of: ${STATUSES.join(", ")}` },
          { status: 400 },
        );
      }

      if (email || username) {
        const duplicate = db
          .query(`
            SELECT id
            FROM users
            WHERE (email = ? OR username = ?)
              AND id != ?
          `)
          .get(email ?? "", username ?? "", id);

        if (duplicate) {
          return Response.json(
            { error: "Email or username already taken" },
            { status: 409 },
          );
        }
      }

      if (position_id !== undefined && position_id !== null) {
        const position = db
          .query(`SELECT id FROM positions WHERE id = ?`)
          .get(position_id);

        if (!position) {
          return Response.json(
            { error: "Position not found" },
            { status: 404 },
          );
        }
      }

      const password_hash = password
        ? await Bun.password.hash(password)
        : null;

      db.query(`
        UPDATE users
        SET
          email         = COALESCE(?, email),
          username      = COALESCE(?, username),
          password_hash = COALESCE(?, password_hash),
          full_name     = COALESCE(?, full_name),
          avatar_url    = COALESCE(?, avatar_url),
          position_id   = COALESCE(?, position_id),
          role          = COALESCE(?, role),
          status        = COALESCE(?, status),
          updated_at    = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        email ?? null,
        username ?? null,
        password_hash,
        full_name ?? null,
        avatar_url ?? null,
        position_id ?? null,
        role ?? null,
        status ?? null,
        id,
      );

      const user = db
        .query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`)
        .get(id);

      return Response.json(user);
    },

    DELETE(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json({ error: "Invalid user id" }, { status: 400 });
      }

      const admins = db
        .query(`SELECT COUNT(*) AS count FROM users WHERE role = 'admin'`)
        .get() as { count: number };

      const target = db
        .query(`SELECT role FROM users WHERE id = ?`)
        .get(id) as { role: string } | null;

      if (!target) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      if (target.role === "admin" && admins.count <= 1) {
        return Response.json(
          { error: "Cannot delete the last admin" },
          { status: 409 },
        );
      }

      db.query(`DELETE FROM users WHERE id = ?`).run(id);

      return Response.json({
        success: true,
        message: "User deleted",
      });
    },
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

      const user = db
        .query(`
          SELECT id, email, username, password_hash, full_name,
                 position_id, role, status
          FROM users
          WHERE email = ? OR username = ?
        `)
        .get(login, login) as
        | {
            id: number;
            email: string;
            username: string;
            password_hash: string;
            full_name: string | null;
            position_id: number | null;
            role: string;
            status: string;
          }
        | null;

      if (!user || !(await Bun.password.verify(password, user.password_hash))) {
        return Response.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }

      if (user.status !== "active") {
        return Response.json(
          { error: `Account is ${user.status}` },
          { status: 403 },
        );
      }

      db.query(`
        UPDATE users
        SET last_login_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(user.id);

      const { password_hash, ...safe } = user;

      return Response.json({ user: safe });
    },
  },
};