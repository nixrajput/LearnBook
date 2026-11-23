import { describe, it, expect, beforeAll, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../helpers/test-db";

const session = vi.hoisted(() => ({ user: { id: "zz-reader", plan: "FREE" } }));
vi.mock("@/lib/auth/session", () => ({
  requireApiSession: async () => session.user,
  requireSession: async () => session.user,
}));

describe("course access for uploaded content", () => {
  let db: typeof import("@/lib/db").db;

  beforeAll(async () => {
    useTestDatabase();
    ({ db } = await import("@/lib/db"));
    await db.user.createMany({
      data: [
        { id: "zz-reader", email: "zz-reader@example.test" },
        { id: "zz-owner", email: "zz-owner@example.test" },
      ],
    });
    for (const [id, isPublished, uploadedBy] of [
      ["zz-public", true, null],
      ["zz-private", false, "zz-owner"],
    ] as const) {
      await db.course.create({
        data: {
          id,
          title: id,
          description: "",
          collectionId: id,
          totalParts: 1,
          totalChapters: 1,
          isPublished,
          uploadedBy,
        },
      });
      const part = await db.part.create({
        data: { courseId: id, number: 1, romanNumeral: "I", title: "P", sortOrder: 0 },
      });
      await db.chapter.create({
        data: {
          id: `${id}-ch`,
          partId: part.id,
          courseId: id,
          number: 1,
          title: "C",
          slug: "c",
          rawContent: "secret notes",
          wordCount: 2,
          readingTimeMin: 1,
          sortOrder: 0,
        },
      });
    }
    await db.aiCreditBalance.create({ data: { userId: "zz-reader", credits: 50 } });
  }, 60_000);

  it("does not let a user activate another user's private upload", async () => {
    const { getActiveCourseId } = await import("@/lib/content/parser");
    await db.userPreference.create({ data: { userId: "zz-reader", activeCourseId: "zz-private" } });

    expect(await getActiveCourseId("zz-reader")).toBe("zz-public");
    expect(await getActiveCourseId("zz-owner")).toBe("zz-public");
  });

  it("returns 404 from AI ask for another user's private chapter and keeps the credits", async () => {
    const { POST } = await import("@/app/api/ai/ask/route");
    const res = await POST(
      new NextRequest("http://localhost/api/ai/ask", {
        method: "POST",
        body: JSON.stringify({ question: "What is in it?", chapterId: "zz-private-ch" }),
      }),
    );

    expect(res.status).toBe(404);
    const balance = await db.aiCreditBalance.findUnique({ where: { userId: "zz-reader" } });
    expect(balance?.credits).toBe(50);
  });

  it("lists only published courses and the caller's own uploads", async () => {
    const { GET } = await import("@/app/api/courses/route");
    const listedIds = async () =>
      ((await (await GET()).json()) as { id: string }[]).map((c) => c.id);

    expect(await listedIds()).toEqual(["zz-public"]);
    session.user = { id: "zz-owner", plan: "FREE" };
    try {
      expect((await listedIds()).sort()).toEqual(["zz-private", "zz-public"]);
    } finally {
      session.user = { id: "zz-reader", plan: "FREE" };
    }
  });

  it("returns 404 when activating a course the caller may not read", async () => {
    const { POST } = await import("@/app/api/courses/[id]/activate/route");
    const activate = (id: string) =>
      POST(new NextRequest(`http://localhost/api/courses/${id}/activate`, { method: "POST" }), {
        params: Promise.resolve({ id }),
      });

    expect((await activate("zz-private")).status).toBe(404);
    expect((await activate("zz-missing")).status).toBe(404);
    expect((await activate("zz-public")).status).toBe(200);
  });

  it("shows a course page only to users who may read the course", async () => {
    const page = await import("@/app/(app)/courses/[id]/page");
    const props = (id: string) => ({ params: Promise.resolve({ id }) });

    await expect(page.default(props("zz-private"))).rejects.toMatchObject({
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    });
    expect(await page.generateMetadata(props("zz-private"))).toEqual({ title: "Course" });
    const prefs = await db.userPreference.findUnique({ where: { userId: "zz-reader" } });
    expect(prefs?.activeCourseId).not.toBe("zz-private");
    await expect(page.default(props("zz-public"))).resolves.toBeTruthy();
  });
});
