import { isAbsolute, resolve } from "node:path";

// Prisma 6 resolved a relative SQLite path against prisma/, Prisma 7 against the working
// directory. Keep the Prisma 6 meaning so existing DATABASE_URL values open the same file.
export function sqliteUrl(url = process.env.DATABASE_URL ?? ""): string {
  if (!url.startsWith("file:")) return url;
  const path = url.slice("file:".length);
  return isAbsolute(path) ? url : `file:${resolve(process.cwd(), "prisma", path)}`;
}
