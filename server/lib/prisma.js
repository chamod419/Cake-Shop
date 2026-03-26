import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis;

if (!globalForPrisma.__prisma) {
  globalForPrisma.__prisma = new PrismaClient();
}

export const prisma = globalForPrisma.__prisma;