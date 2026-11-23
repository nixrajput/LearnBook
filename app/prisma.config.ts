import { defineConfig } from "prisma/config";
import { sqliteUrl } from "./src/lib/sqlite-url";

// Prisma 7 no longer reads .env. Next.js still does, so only the CLI needs this.
try {
  process.loadEnvFile();
} catch {
  // No .env file: CI passes DATABASE_URL in the environment.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: sqliteUrl() },
});
