import { db } from "../db";

export const planRoutes = {
  "/api/plans": {
    GET() {
      const plans = db
        .query(`
          SELECT
            id,
            name,
            description,
            status,
            created_at,
            updated_at
          FROM plans
          ORDER BY id DESC
        `)
        .all();

      return Response.json(plans);
    },

    async POST(req: Request) {
      const body = await req.json();

      const { name, description, status } = body;

      if (!name || typeof name !== "string") {
        return Response.json(
          {
            error: "name is required",
          },
          { status: 400 },
        );
      }

      const result = db
        .query(`
          INSERT INTO plans (
            name,
            description,
            status
          )
          VALUES (?, ?, ?)
        `)
        .run(
          name,
          description ?? null,
          status ?? "active",
        );

      const plan = db
        .query(`
          SELECT *
          FROM plans
          WHERE id = ?
        `)
        .get(result.lastInsertRowid);

      return Response.json(plan, {
        status: 201,
      });
    },
  },

  "/api/plans/:id": {
    GET(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json(
          { error: "Invalid plan id" },
          { status: 400 },
        );
      }

      const plan = db
        .query(`
          SELECT *
          FROM plans
          WHERE id = ?
        `)
        .get(id);

      if (!plan) {
        return Response.json(
          { error: "Plan not found" },
          { status: 404 },
        );
      }

      return Response.json(plan);
    },

    async PUT(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json(
          { error: "Invalid plan id" },
          { status: 400 },
        );
      }

      const body = await req.json();

      const { name, description, status } = body;

      const existing = db
        .query(`
          SELECT id
          FROM plans
          WHERE id = ?
        `)
        .get(id);

      if (!existing) {
        return Response.json(
          { error: "Plan not found" },
          { status: 404 },
        );
      }

      db.query(`
        UPDATE plans
        SET
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        name ?? null,
        description ?? null,
        status ?? null,
        id,
      );

      const plan = db
        .query(`
          SELECT *
          FROM plans
          WHERE id = ?
        `)
        .get(id);

      return Response.json(plan);
    },

    DELETE(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json(
          { error: "Invalid plan id" },
          { status: 400 },
        );
      }

      const result = db
        .query(`
          DELETE FROM plans
          WHERE id = ?
        `)
        .run(id);

      if (result.changes === 0) {
        return Response.json(
          { error: "Plan not found" },
          { status: 404 },
        );
      }

      return Response.json({
        success: true,
        message: "Plan deleted",
      });
    },
  },
};