// The app's single shared Prisma client.
// Uses Neon's pooled connection (DATABASE_URL) through the Neon driver adapter.
// Next.js loads .env itself, so no dotenv import is needed here.
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// In development, hot reload re-runs this module on every edit. Stashing the
// client on globalThis reuses one client instead of opening a new pool each time.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
