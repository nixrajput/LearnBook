import { execFileSync } from "child_process";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Pushes the Prisma schema into a new temporary SQLite file and points DATABASE_URL at it.
 * Call it before the first import of @/lib/db, which reads DATABASE_URL when it loads.
 */
export function useTestDatabase(): void {
  const file = join(mkdtempSync(join(tmpdir(), "learnbook-test-")), "test.db");
  execFileSync("npx", ["prisma", "db", "push", "--url", `file:${file}`], {
    cwd: join(__dirname, "../../.."),
    stdio: "ignore",
  });
  process.env.DATABASE_URL = `file:${file}`;
}
