import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { sqliteUrl } from "@/lib/sqlite-url";

describe("sqliteUrl", () => {
  it("resolves a relative file: path under prisma/, as Prisma 6 did", () => {
    expect(sqliteUrl("file:./dev.db")).toBe(`file:${resolve(process.cwd(), "prisma", "dev.db")}`);
  });

  it("keeps an absolute file: path", () => {
    expect(sqliteUrl("file:/var/data/app.db")).toBe("file:/var/data/app.db");
  });

  it("leaves a non-file URL unchanged", () => {
    expect(sqliteUrl("")).toBe("");
  });
});
