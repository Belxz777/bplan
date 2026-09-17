import { Database } from "bun:sqlite";

// Свежая in-memory база на каждый вызов — тесты не должны зависеть
// друг от друга и от порядка запуска (изоляция тестов).
export function createTestDb(): Database {
  const db = new Database(":memory:");

  db.run(`PRAGMA foreign_keys = ON;`);

  db.run(`
    CREATE TABLE positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      description TEXT,
      department TEXT NOT NULL DEFAULT 'general',
      level TEXT NOT NULL DEFAULT 'middle',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      position_id INTEGER,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'active',
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL
    );
  `);

  return db;
}
