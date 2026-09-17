import { Database } from "bun:sqlite";

const db = new Database("./data/db.sqlite", {
  create: true,
});

db.query(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,
    description TEXT,

    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'completed', 'archived')),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    plan_id INTEGER NOT NULL,

    title TEXT NOT NULL,
    description TEXT,

    status TEXT NOT NULL DEFAULT 'todo'
      CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),

    priority TEXT NOT NULL DEFAULT 'medium'
      CHECK (priority IN ('low', 'medium', 'high', 'critical')),

    due_date TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (plan_id)
      REFERENCES plans(id)
      ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_plan_id
    ON tasks(plan_id);

  CREATE INDEX IF NOT EXISTS idx_tasks_status
    ON tasks(status);

  CREATE INDEX IF NOT EXISTS idx_tasks_priority
    ON tasks(priority);
`);

export { db };