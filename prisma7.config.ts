// Config for the Prisma CLI (migrate, validate, seed, studio).
// The CLI uses Neon's direct (unpooled) connection: migrations need a real
// session, which a connection pooler can't guarantee. The running app uses the
// pooled DATABASE_URL instead; see src/lib/prisma.ts.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
