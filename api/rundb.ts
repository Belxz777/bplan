import { db } from "./db";

export const createTables = () => {
  db.query(` 
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    email TEXT UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1
      CHECK (level IN (1, 2, 3)),
    last_login_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,
    description TEXT,
    creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'completed', 'archived')),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Участники плана: кто owner, кто contributor
  CREATE TABLE IF NOT EXISTS plan_members (
    plan_id INTEGER NOT NULL
      REFERENCES plans(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL
      REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'contributor'
      CHECK (role IN ('owner', 'contributor')),

    added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (plan_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    plan_id INTEGER NOT NULL
      REFERENCES plans(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT,

    status TEXT NOT NULL DEFAULT 'todo'
      CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'medium'
      CHECK (priority IN ('low', 'medium', 'high', 'critical')),

    due_date TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_plan_id ON tasks(plan_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
  CREATE INDEX IF NOT EXISTS idx_plan_members_user ON plan_members(user_id);
`);
}
