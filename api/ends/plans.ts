import { eq, sql, and } from "drizzle-orm";

import { db } from "../db";
import { plans, planMembers, users } from "../db/schema";
import { requireAuth } from "../middleware/auth";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}

async function getPlanMember(planId: number, userId: number) {
  return db.query.planMembers.findFirst({
    where: and(
      eq(planMembers.planId, planId),
      eq(planMembers.userId, userId),
    ),
  });
}

async function canManagePlan(planId: number, userId: number, level: number) {
  if (level >= 3) {
    return true;
  }

  const plan = await db.query.plans.findFirst({
    where: eq(plans.id, planId),
  });

  if (!plan) {
    return false;
  }

  return plan.creatorId === userId;
}

export const planRoutes = {
   "/api/plans": {
    GET: requireAuth(async (req: Request) => {
      // Level 3 видит все проекты
      if (req.user.level >= 3) {
        const rows = await db.query.plans.findMany({
          orderBy: (p, { desc }) => desc(p.id),
        });

        return Response.json(rows);
      }

      // Остальные видят только проекты,
      // в которых они являются участниками
      const rows = await db
        .select({
          id: plans.id,
          name: plans.name,
          description: plans.description,
          creatorId: plans.creatorId,
          status: plans.status,
          createdAt: plans.createdAt,
          updatedAt: plans.updatedAt,
        })
        .from(plans)
        .innerJoin(
          planMembers,
          eq(planMembers.planId, plans.id),
        )
        .where(eq(planMembers.userId, req.user.id))
        .orderBy(plans.id);

      return Response.json(rows);
    }),

    POST: requireAuth(async (req: Request) => {
      const body = await req.json();

      const { name, description, status } = body;

      if (!name || typeof name !== "string") {
        return Response.json(
          { error: "name is required" },
          { status: 400 },
        );
      }

      // Создаём проект
      const [plan] = await db
        .insert(plans)
        .values({
          name,
          description: description ?? null,
          status: status ?? "active",
          creatorId: req.user.id,
        })
        .returning();

      if (!plan) {
        return Response.json(
          { error: "Failed to create plan" },
          { status: 500 },
        );
      }

      // Создатель автоматически становится owner проекта
      await db.insert(planMembers).values({
        planId: plan.id,
        userId: req.user.id,
        role: "owner",
      });

      return Response.json(plan, { status: 201 });
    }),
  },

  "/api/plans/:id": {
    async GET(
      req: Request & {
        params: { id: string };
      },
    ) {
      const id = parseId(req.params.id);

      if (id === null) {
        return Response.json(
          { error: "Invalid plan id" },
          { status: 400 },
        );
      }

      const plan = await db.query.plans.findFirst({
        where: eq(plans.id, id),
      });

      if (!plan) {
        return Response.json(
          { error: "Plan not found" },
          { status: 404 },
        );
      }

      return Response.json(plan);
    },

    PUT: requireAuth(
      async (
        req: Request & {
          params: { id: string };
        },
      ) => {
        const id = parseId(req.params.id);

        if (id === null) {
          return Response.json(
            { error: "Invalid plan id" },
            { status: 400 },
          );
        }

        const body = await req.json();

        const { name, description, status } = body;

        const existing = await db.query.plans.findFirst({
          where: eq(plans.id, id),
        });

        if (!existing) {
          return Response.json(
            { error: "Plan not found" },
            { status: 404 },
          );
        }

        const allowed = await canManagePlan(
          id,
          req.user.id,
          req.user.level,
        );

        if (!allowed) {
          return Response.json(
            { error: "You do not have permission to modify this plan" },
            { status: 403 },
          );
        }

        const [plan] = await db
          .update(plans)
          .set({
            name,
            description,
            status,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(plans.id, id))
          .returning();

        return Response.json(plan);
      },
    ),

    DELETE: requireAuth(
      async (
        req: Request & {
          params: { id: string };
        },
      ) => {
        const id = parseId(req.params.id);

        if (id === null) {
          return Response.json(
            { error: "Invalid plan id" },
            { status: 400 },
          );
        }

        const existing = await db.query.plans.findFirst({
          where: eq(plans.id, id),
        });

        if (!existing) {
          return Response.json(
            { error: "Plan not found" },
            { status: 404 },
          );
        }

        const allowed = await canManagePlan(
          id,
          req.user.id,
          req.user.level,
        );

        if (!allowed) {
          return Response.json(
            { error: "You do not have permission to delete this plan" },
            { status: 403 },
          );
        }

        await db
          .delete(plans)
          .where(eq(plans.id, id));

        return Response.json({
          success: true,
          message: "Plan deleted",
        });
      },
    ),
  },

  // ---------------------------------------------------------
  // MEMBERS
  // ---------------------------------------------------------

  "/api/plans/:id/members": {
    // Получить участников проекта
    GET: requireAuth(
      async (
        req: Request & {
          params: { id: string };
        },
      ) => {
        const planId = parseId(req.params.id);

        if (planId === null) {
          return Response.json(
            { error: "Invalid plan id" },
            { status: 400 },
          );
        }

        const plan = await db.query.plans.findFirst({
          where: eq(plans.id, planId),
        });

        if (!plan) {
          return Response.json(
            { error: "Plan not found" },
            { status: 404 },
          );
        }

        // Level 3 видит всех.
        // Остальные должны быть участниками проекта.
        if (req.user.level < 3) {
          const member = await getPlanMember(
            planId,
            req.user.id,
          );

          if (!member) {
            return Response.json(
              { error: "You are not a member of this plan" },
              { status: 403 },
            );
          }
        }

        const members = await db
          .select({
            userId: users.id,
            username: users.username,
            email: users.email,
            level: users.level,
            role: planMembers.role,
            addedAt: planMembers.addedAt,
          })
          .from(planMembers)
          .innerJoin(
            users,
            eq(planMembers.userId, users.id),
          )
          .where(eq(planMembers.planId, planId))
          .orderBy(users.id);

        return Response.json(members);
      },
    ),

    // Добавить участника
    POST: requireAuth(
      async (
        req: Request & {
          params: { id: string };
        },
      ) => {
        const planId = parseId(req.params.id);

        if (planId === null) {
          return Response.json(
            { error: "Invalid plan id" },
            { status: 400 },
          );
        }

        const allowed = await canManagePlan(
          planId,
          req.user.id,
          req.user.level,
        );

        if (!allowed) {
          return Response.json(
            { error: "You do not have permission to add members" },
            { status: 403 },
          );
        }

        const plan = await db.query.plans.findFirst({
          where: eq(plans.id, planId),
        });

        if (!plan) {
          return Response.json(
            { error: "Plan not found" },
            { status: 404 },
          );
        }

        const body = await req.json();

        const userId = Number(body.userId);

        if (!Number.isInteger(userId)) {
          return Response.json(
            { error: "userId is required" },
            { status: 400 },
          );
        }

        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (!user) {
          return Response.json(
            { error: "User not found" },
            { status: 404 },
          );
        }

        const existingMember = await getPlanMember(
          planId,
          userId,
        );

        if (existingMember) {
          return Response.json(
            { error: "User is already a member of this plan" },
            { status: 409 },
          );
        }

        const role =
          body.role === "owner"
            ? "owner"
            : "contributor";

        const [member] = await db
          .insert(planMembers)
          .values({
            planId,
            userId,
            role,
          })
          .returning();

        return Response.json(
          {
            ...member,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              level: user.level,
            },
          },
          { status: 201 },
        );
      },
    ),
  },

  // ---------------------------------------------------------
  // REMOVE MEMBER
  // ---------------------------------------------------------

  "/api/plans/:id/members/:userId": {
    DELETE: requireAuth(
      async (
        req: Request & {
          params: {
            id: string;
            userId: string;
          };
        },
      ) => {
        const planId = parseId(req.params.id);
        const userId = parseId(req.params.userId);

        if (planId === null || userId === null) {
          return Response.json(
            { error: "Invalid plan id or user id" },
            { status: 400 },
          );
        }

        const allowed = await canManagePlan(
          planId,
          req.user.id,
          req.user.level,
        );

        if (!allowed) {
          return Response.json(
            { error: "You do not have permission to remove members" },
            { status: 403 },
          );
        }

        const member = await getPlanMember(
          planId,
          userId,
        );

        if (!member) {
          return Response.json(
            { error: "Member not found" },
            { status: 404 },
          );
        }

        // Нельзя удалить owner через обычное удаление
        if (member.role === "owner") {
          return Response.json(
            { error: "Cannot remove plan owner" },
            { status: 400 },
          );
        }

        await db
          .delete(planMembers)
          .where(
            and(
              eq(planMembers.planId, planId),
              eq(planMembers.userId, userId),
            ),
          );

        return Response.json({
          success: true,
          message: "Member removed",
        });
      },
    ),
  },
};