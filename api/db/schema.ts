import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
sqliteTable,
text,
integer,
index,
primaryKey,
check,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
"users",
{
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  level: integer("level").notNull().default(1),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},
(table) => ({
  levelCheck: check("users_level_check", sql`${table.level} IN (1, 2, 3)`),
}),
);

export const plans = sqliteTable(
"plans",
{
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  creatorId: integer("creator_id").references(() => users.id, {
    onDelete: "set null",
  }),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},
(table) => ({
  statusCheck: check(
    "plans_status_check",
    sql`${table.status} IN ('active', 'completed', 'archived')`,
  ),
}),
);

export const planMembers = sqliteTable(
"plan_members",
{
  planId: integer("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("contributor"),
  addedAt: text("added_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},
(table) => ({
  pk: primaryKey({ columns: [table.planId, table.userId] }),
  userIdx: index("idx_plan_members_user").on(table.userId),
  roleCheck: check(
    "plan_members_role_check",
    sql`${table.role} IN ('owner', 'contributor')`,
  ),
}),
);

export const tasks = sqliteTable(
"tasks",
{
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"),
  assigneeId: integer("assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  priority: text("priority").notNull().default("medium"),
  dueDate: text("due_date"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},
(table) => ({
  planIdx: index("idx_tasks_plan_id").on(table.planId),
  statusIdx: index("idx_tasks_status").on(table.status),
  priorityIdx: index("idx_tasks_priority").on(table.priority),
  statusCheck: check(
    "tasks_status_check",
    sql`${table.status} IN ('todo', 'in_progress', 'done', 'cancelled')`,
  ),
  priorityCheck: check(
    "tasks_priority_check",
    sql`${table.priority} IN ('low', 'medium', 'high', 'critical')`,
  ),
}),
);

// ---- relations, чтобы делать db.query.X.findMany({ with: {...} }) вместо ручных JOIN ----

export const usersRelations = relations(users, ({ many }) => ({
plans: many(plans),
tasks: many(tasks),
}));

export const plansRelations = relations(plans, ({ one, many }) => ({
creator: one(users, {
  fields: [plans.creatorId],
  references: [users.id],
}),
tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
plan: one(plans, {
  fields: [tasks.planId],
  references: [plans.id],
}),
assignee: one(users, {
  fields: [tasks.assigneeId],
  references: [users.id],
}),
}));
