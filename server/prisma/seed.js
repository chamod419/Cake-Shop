import "dotenv/config"; // ✅ IMPORTANT: load .env for seed
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

async function main() {
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in server/.env");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const existing = await prisma.user.findUnique({ where: { username: adminUsername } });

  if (!existing) {
    await prisma.user.create({
      data: {
        username: adminUsername,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log("✅ Admin user created:", adminUsername);
  } else {
    await prisma.user.update({
      where: { username: adminUsername },
      data: {
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log("✅ Admin user updated (password + role):", adminUsername);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
