import { db } from "../db";

export async function seed() {
  const { count } = db
    .query(`SELECT COUNT(*) AS count FROM users`)
    .get() as { count: number };

  if (count > 0) return;

  const positions = [
    { title: "System Administrator", department: "it",         level: "head"   },
    { title: "Project Manager",      department: "management", level: "lead"   },
    { title: "Backend Developer",    department: "engineering", level: "middle" },
    { title: "Frontend Developer",   department: "engineering", level: "middle" },
    { title: "QA Engineer",          department: "engineering", level: "junior" },
  ];

  const insertPosition = db.query(`
    INSERT INTO positions (title, description, department, level)
    VALUES (?, ?, ?, ?)
  `);

  for (const p of positions) {
    insertPosition.run(p.title, null, p.department, p.level);
  }

  const insertUser = db.query(`
    INSERT INTO users (
      email, username, password_hash, full_name, position_id, role
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const users = [
    {
      email: "admin@blex.local",
      username: "admin",
      password: process.env.ADMIN_PASSWORD ?? "admin12345",
      full_name: "Administrator",
      position: "System Administrator",
      role: "admin",
    },
    {
      email: "manager@bplan.local",
      username: "manager",
      password: "manager12345",
      full_name: "Default Manager",
      position: "Project Manager",
      role: "manager",
    },
  ];

  for (const u of users) {
    const position = db
      .query(`SELECT id FROM positions WHERE title = ?`)
      .get(u.position) as { id: number } | null;

    insertUser.run(
      u.email,
      u.username,
      await Bun.password.hash(u.password),
      u.full_name,
      position?.id ?? null,
      u.role,
    );
  }

  console.log("[seed] positions and users created");
}