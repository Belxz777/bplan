
import { and, eq, or, sql } from "drizzle-orm";

import { db } from "../db";
import { plans, tasks, users,planMembers } from "../db/schema";
import { requireAuth, type AuthUser } from "../middleware/auth";

function parseId(raw: string): number | null {
  const id = Number(raw);

  return Number.isInteger(id) ? id : null;
}

/**
 * Возвращает условие доступа к задачам:
 *
 * level 1 -> только свои задачи
 * level 2 -> задачи пользователей level 1
 * level 3 -> все задачи
 */
function taskAccessCondition(user: AuthUser) {
  // Level 3 видит всё
  if (user.level >= 3) {
    return undefined;
  }

  // Пользователь должен быть участником проекта
  const isPlanMember = sql<boolean>`
    EXISTS (
      SELECT 1
      FROM plan_members pm
      WHERE pm.plan_id = ${tasks.planId}
        AND pm.user_id = ${user.id}
    )
  `;

  // Level 1:
  // только свои задачи + только в доступных проектах
  if (user.level === 1) {
    return and(
      eq(tasks.assigneeId, user.id),
      isPlanMember,
    );
  }

  // Level 2:
  // задачи level 1 и level 2
  // + только в доступных проектах
  return and(
    or(
      eq(users.level, 1),
      eq(users.level, 2),
    ),
    isPlanMember,
  );
}
/**
 * Форматирует задачу.
 *
 * Для level 3 дополнительно показываем,
 * кому назначена задача.
 */
function formatTask(
  task: typeof tasks.$inferSelect,
  assignee: {
    id: number;
    username: string;
    email: string | null;
    level: number;
  } | null,
  currentUser: AuthUser,
) {
  const result = {
    ...task,
  };

  if (currentUser.level === 3) {
    return {
      ...result,
      assignee: assignee
        ? {
            id: assignee.id,
            username: assignee.username,
            email: assignee.email,
            level: assignee.level,
          }
        : null,
    };
  }

  return result;
}

export const taskRoutes = {
  "/api/tasks": {
    /**
     * Получение задач:
     *
     * level 1 -> свои
     * level 2 -> задачи пользователей level 1
     * level 3 -> все + информация об исполнителе
     */
 GET: requireAuth(async (req) => {
  const condition = taskAccessCondition(req.user);

  const rows = await db
    .select({
      task: tasks,
      planName: plans.name,
      assignee: {
        id: users.id,
        username: users.username,
        email: users.email,
        level: users.level,
      },
    })
    .from(tasks)
    .leftJoin(plans, eq(tasks.planId, plans.id))
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(condition)
    .orderBy(sql`${tasks.id} DESC`);

  const result = rows.map(({ task, planName, assignee }) => ({
    ...formatTask(task, assignee, req.user),
    plan_name: planName ?? null,
  }));

  return Response.json(result);
}),

    /**
     * Создание задачи.
     *
     * Создатель/исполнитель автоматически становится
     * текущим авторизованным пользователем.
     */
    POST: requireAuth(async (req) => {
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

      const plan = await db.query.plans.findFirst({
        where: eq(plans.id, plan_id),
      });

      if (!plan) {
        return Response.json(
          {
            error: "Plan not found",
          },
          { status: 404 },
        );
      }

      const [task] = await db
        .insert(tasks)
        .values({
          planId: plan_id,
          title,
          description: description ?? null,
          status: status ?? "todo",
          priority: priority ?? "medium",
          dueDate: due_date ?? null,

          // Автоматически назначаем задачу текущему пользователю
          assigneeId: req.user.id,
        })
        .returning();

      return Response.json(task, { status: 201 });
    }),
  },

  /**
   * Получение / изменение / удаление конкретной задачи.
   */
  "/api/tasks/:id": {
    GET: requireAuth(async (req) => {
      
      const id = parseId(req.params!.id);

      if (id === null) {
        return Response.json(
          { error: "Invalid task id" },
          { status: 400 },
        );
      }

     const condition = taskAccessCondition(req.user);

      const whereCondition = condition
  ? and(eq(tasks.id, id), condition)
  : eq(tasks.id, id);
      const [row] = await db
        .select({
          task: tasks,
          planName: plans.name,
          assignee: {
            id: users.id,
            username: users.username,
            email: users.email,
            level: users.level,
          },
        })
        .from(tasks)
        .leftJoin(plans, eq(tasks.planId, plans.id))
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .where(whereCondition)
        .limit(1);

      if (!row) {
        return Response.json(
          { error: "Task not found" },
          { status: 404 },
        );
      }

      return Response.json({
        ...formatTask(
          row.task,
          row.assignee,
          req.user,
        ),
        plan_name: row.planName ?? null,
      });
    }),

    PUT: requireAuth(async (req) => {
      const id = parseId(req.params!.id);

      if (id === null) {
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

      const existing = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
      });

      if (!existing) {
        return Response.json(
          { error: "Task not found" },
          { status: 404 },
        );
      }
      const currentPlanMember = await db.query.planMembers.findFirst({
  where: and(
    eq(planMembers.planId, existing.planId),
    eq(planMembers.userId, req.user.id),
  ),
});

if (req.user.level < 3 && !currentPlanMember) {
  return Response.json(
    { error: "You are not a member of this plan" },
    { status: 403 },
  );
}
      /**
       * Проверяем, имеет ли пользователь право менять эту задачу.
       */
    if (req.user.level === 1) {
  if (existing.assigneeId !== req.user.id) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 },
    );
  }
}

if (req.user.level === 2) {
  const assignee = existing.assigneeId
    ? await db.query.users.findFirst({
        where: eq(users.id, existing.assigneeId),
        columns: {
          level: true,
        },
      })
    : null;

  if (!assignee || assignee.level > 2) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 },
    );
  }
}
      /**
       * Не даём пользователю менять assigneeId через body.
       *
       * Если нужно будет сделать переназначение задачи,
       * это лучше сделать отдельным endpoint'ом с проверкой level.
       */
      const [task] = await db
        .update(tasks)
        .set({
          planId: plan_id ?? existing.planId,
          title: title ?? existing.title,
          description:
            description !== undefined
              ? description
              : existing.description,
          status: status ?? existing.status,
          priority: priority ?? existing.priority,
          dueDate:
            due_date !== undefined
              ? due_date
              : existing.dueDate,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(tasks.id, id))
        .returning();

      return Response.json(task);
    }),

    DELETE: requireAuth(async (req) => {
      const id = parseId(req.params!.id);

      if (id === null) {
        return Response.json(
          { error: "Invalid task id" },
          { status: 400 },
        );
      }

      const existing = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
      });

      if (!existing) {
        return Response.json(
          { error: "Task not found" },
          { status: 404 },
        );
      }

      /**
       * Level 1 -> только свои задачи
       * Level 2 -> задачи level 1
       * Level 3 -> любые
       */
      if (req.user.level === 1) {
        if (existing.assigneeId !== req.user.id) {
          return Response.json(
            { error: "Forbidden" },
            { status: 403 },
          );
        }
      }

      if (req.user.level === 2) {
        const assignee = existing.assigneeId
          ? await db.query.users.findFirst({
              where: eq(users.id, existing.assigneeId),
              columns: {
                level: true,
              },
            })
          : null;

        if (!assignee || assignee.level !== 1) {
          return Response.json(
            { error: "Forbidden" },
            { status: 403 },
          );
        }
      }

      await db
        .delete(tasks)
        .where(eq(tasks.id, id));

      return Response.json({
        success: true,
        message: "Task deleted",
      });
    }),
  },

  /**
   * Получение задач конкретного плана.
   *
   * level 1 -> только свои задачи в этом плане
   * level 2 -> задачи пользователей level 1
   * level 3 -> все задачи + имена исполнителей
   */
  "/api/plans/:planId/tasks": {
    GET: requireAuth(async (req) => {
      const planId = parseId(req.params!.planId);
const plan = await db.query.plans.findFirst({
  where: eq(plans.id, planId),
});

if (!plan) {
  return Response.json(
    { error: "Plan not found" },
    { status: 404 },
  );
}

if (req.user.level < 3) {
  const member = await db.query.planMembers.findFirst({
    where: and(
      eq(planMembers.planId, planId),
      eq(planMembers.userId, req.user.id),
    ),
  });

  if (!member) {
    return Response.json(
      { error: "You are not a member of this plan" },
      { status: 403 },
    );
  }
}

      const condition = taskAccessCondition(req.user);

      const whereCondition = condition
        ? and(eq(tasks.planId, planId), condition)
        : eq(tasks.planId, planId);

      const rows = await db
        .select({
          task: tasks,
          assignee: {
            id: users.id,
            username: users.username,
            email: users.email,
            level: users.level,
          },
        })
        .from(tasks)
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .where(whereCondition)
        .orderBy(sql`${tasks.id} DESC`);

      const result = rows.map(({ task, assignee }) =>
        formatTask(
          task,
          assignee,
          req.user,
        ),
      );

      return Response.json(result);
    }),
  },
};
