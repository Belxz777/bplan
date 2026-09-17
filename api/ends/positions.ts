import { db } from "../db";

const LEVELS = ["intern", "junior", "middle", "senior", "lead", "head"];

export const positionRoutes = {
  "/api/positions": {
    GET() {
      const positions = db
        .query(`
          SELECT
            positions.*,
            (
              SELECT COUNT(*)
              FROM users
              WHERE users.position_id = positions.id
            ) AS users_count
          FROM positions
          ORDER BY positions.department, positions.title
        `)
        .all();

      return Response.json(positions);
    },

    async POST(req: Request) {
      const body = await req.json();
      const { title, description, department, level } = body;

      if (!title) {
        return Response.json(
          { error: "title is required" },
          { status: 400 },
        );
      }

      if (level && !LEVELS.includes(level)) {
        return Response.json(
          { error: `level must be one of: ${LEVELS.join(", ")}` },
          { status: 400 },
        );
      }

      const duplicate = db
        .query(`SELECT id FROM positions WHERE title = ?`)
        .get(title);

      if (duplicate) {
        return Response.json(
          { error: "Position with this title already exists" },
          { status: 409 },
        );
      }

      const result = db
        .query(`
          INSERT INTO positions (title, description, department, level)
          VALUES (?, ?, ?, ?)
        `)
        .run(
          title,
          description ?? null,
          department ?? "general",
          level ?? "middle",
        );

      const position = db
        .query(`SELECT * FROM positions WHERE id = ?`)
        .get(result.lastInsertRowid);

      return Response.json(position, { status: 201 });
    },
  },

  "/api/positions/:id": {
    GET(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json({ error: "Invalid position id" }, { status: 400 });
      }

      const position = db
        .query(`SELECT * FROM positions WHERE id = ?`)
        .get(id);

      if (!position) {
        return Response.json({ error: "Position not found" }, { status: 404 });
      }

      return Response.json(position);
    },

    async PUT(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json({ error: "Invalid position id" }, { status: 400 });
      }

      const body = await req.json();
      const { title, description, department, level } = body;

      const existing = db
        .query(`SELECT id FROM positions WHERE id = ?`)
        .get(id);

      if (!existing) {
        return Response.json({ error: "Position not found" }, { status: 404 });
      }

      if (level && !LEVELS.includes(level)) {
        return Response.json(
          { error: `level must be one of: ${LEVELS.join(", ")}` },
          { status: 400 },
        );
      }

      db.query(`
        UPDATE positions
        SET
          title       = COALESCE(?, title),
          description = COALESCE(?, description),
          department  = COALESCE(?, department),
          level       = COALESCE(?, level),
          updated_at  = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        title ?? null,
        description ?? null,
        department ?? null,
        level ?? null,
        id,
      );

      const position = db
        .query(`SELECT * FROM positions WHERE id = ?`)
        .get(id);

      return Response.json(position);
    },

    DELETE(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json({ error: "Invalid position id" }, { status: 400 });
      }

      const result = db
        .query(`DELETE FROM positions WHERE id = ?`)
        .run(id);

      if (result.changes === 0) {
        return Response.json({ error: "Position not found" }, { status: 404 });
      }

      return Response.json({
        success: true,
        message: "Position deleted",
      });
    },
  },

  "/api/positions/:id/users": (req: Request & { params: { id: string } }) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid position id" }, { status: 400 });
    }

    const users = db
      .query(`
        SELECT
          id, email, username, full_name, avatar_url,
          position_id, role, status, created_at, updated_at
        FROM users
        WHERE position_id = ?
        ORDER BY id DESC
      `)
      .all(id);

    return Response.json(users);
  },
};