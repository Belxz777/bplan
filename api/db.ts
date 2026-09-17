import { Database } from "bun:sqlite";

const db = new Database("./data/db.sqlite", {
  create: true,
});

db.query(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
 CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL UNIQUE,
    description TEXT,

    department TEXT NOT NULL DEFAULT 'general',

    level TEXT NOT NULL DEFAULT 'middle'
      CHECK (level IN ('intern', 'junior', 'middle', 'senior', 'lead', 'head')),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,

    full_name TEXT,
    avatar_url TEXT,

    position_id INTEGER,

    role TEXT NOT NULL DEFAULT 'user'
      CHECK (role IN ('admin', 'manager', 'user')),

    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'inactive', 'banned')),

    last_login_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (position_id)
      REFERENCES positions(id)
      ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_position_id ON users(position_id);
  CREATE INDEX IF NOT EXISTS idx_users_role        ON users(role);
  CREATE INDEX IF NOT EXISTS idx_users_status      ON users(status);
  CREATE INDEX IF NOT EXISTS idx_positions_dept    ON positions(department);
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
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
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