import { db } from "../db";

export const taskRoutes = {
  "/api/tasks": {
    GET() {
      const tasks = db
        .query(`
          SELECT
            tasks.*,
            plans.name AS plan_name
          FROM tasks
          JOIN plans
            ON plans.id = tasks.plan_id
          ORDER BY tasks.id DESC
        `)
        .all();

      return Response.json(tasks);
    },

    async POST(req: Request) {
      const body = await req.json();

      const {
        plan_id,
        title,
        description,
        status,
        priority,
        due_date,
      } = body;

      if (!plan_id || !title) {
        return Response.json(
          {
            error: "plan_id and title are required",
          },
          { status: 400 },
        );
      }

      const plan = db
        .query(`
          SELECT id
          FROM plans
          WHERE id = ?
        `)
        .get(plan_id);

      if (!plan) {
        return Response.json(
          {
            error: "Plan not found",
          },
          { status: 404 },
        );
      }

      const result = db
        .query(`
          INSERT INTO tasks (
            plan_id,
            title,
            description,
            status,
            priority,
            due_date
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(
          plan_id,
          title,
          description ?? null,
          status ?? "todo",
          priority ?? "medium",
          due_date ?? null,
        );

      const task = db
        .query(`
          SELECT *
          FROM tasks
          WHERE id = ?
        `)
        .get(result.lastInsertRowid);

      return Response.json(task, {
        status: 201,
      });
    },
  },

  "/api/tasks/:id": {
    GET(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json(
          { error: "Invalid task id" },
          { status: 400 },
        );
      }

      const task = db
        .query(`
          SELECT
            tasks.*,
            plans.name AS plan_name
          FROM tasks
          JOIN plans
            ON plans.id = tasks.plan_id
          WHERE tasks.id = ?
        `)
        .get(id);

      if (!task) {
        return Response.json(
          { error: "Task not found" },
          { status: 404 },
        );
      }

      return Response.json(task);
    },

    async PUT(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json(
          { error: "Invalid task id" },
          { status: 400 },
        );
      }

      const body = await req.json();

      const {
        plan_id,
        title,
        description,
        status,
        priority,
        due_date,
      } = body;

      const existing = db
        .query(`
          SELECT id
          FROM tasks
          WHERE id = ?
        `)
        .get(id);

      if (!existing) {
        return Response.json(
          { error: "Task not found" },
          { status: 404 },
        );
      }

      if (plan_id !== undefined) {
        const plan = db
          .query(`
            SELECT id
            FROM plans
            WHERE id = ?
          `)
          .get(plan_id);

        if (!plan) {
          return Response.json(
            { error: "Plan not found" },
            { status: 404 },
          );
        }
      }

      db.query(`
        UPDATE tasks
        SET
          plan_id = COALESCE(?, plan_id),
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          due_date = COALESCE(?, due_date),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        plan_id ?? null,
        title ?? null,
        description ?? null,
        status ?? null,
        priority ?? null,
        due_date ?? null,
        id,
      );

      const task = db
        .query(`
          SELECT *
          FROM tasks
          WHERE id = ?
        `)
        .get(id);

      return Response.json(task);
    },

    DELETE(req: Request & { params: { id: string } }) {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return Response.json(
          { error: "Invalid task id" },
          { status: 400 },
        );
      }

      const result = db
        .query(`
          DELETE FROM tasks
          WHERE id = ?
        `)
        .run(id);

      if (result.changes === 0) {
        return Response.json(
          { error: "Task not found" },
          { status: 404 },
        );
      }

      return Response.json({
        success: true,
        message: "Task deleted",
      });
    },
  },

  "/api/plans/:planId/tasks": (req: Request & {
    params: {
      planId: string;
    };
  }) => {
    const planId = Number(req.params.planId);

    if (!Number.isInteger(planId)) {
      return Response.json(
        { error: "Invalid plan id" },
        { status: 400 },
      );
    }

    const tasks = db
      .query(`
        SELECT *
        FROM tasks
        WHERE plan_id = ?
        ORDER BY id DESC
      `)
      .all(planId);

    return Response.json(tasks);
  },
};