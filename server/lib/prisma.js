import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.ts";

const globalForPrisma = globalThis;

// Reuse pool + prisma in dev hot reload / tsx watch (prevents too many connections)
if (!globalForPrisma.__pgPool) {
  globalForPrisma.__pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

if (!globalForPrisma.__prisma) {
  const adapter = new PrismaPg(globalForPrisma.__pgPool);
  globalForPrisma.__prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.__prisma;
