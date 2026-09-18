
import { db } from "../db";
import { users } from "../db/schema";

export async function seed() {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345";

  // Проверяем, существует ли уже admin
  const existingAdmin = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, "admin"),
  });

  if (existingAdmin) {
    console.log("[seed] admin already exists");
    return;
  }

  const passwordHash = await Bun.password.hash(adminPassword);

  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@blex.local",
      username: "admin",
      passwordHash,
      level: 3,
    })
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
      level: users.level,
      createdAt: users.createdAt,
    });

  console.log("[seed] admin created:", admin);
  }
