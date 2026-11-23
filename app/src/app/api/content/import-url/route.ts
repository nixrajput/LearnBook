import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { parseWebArticle, UnsafeUrlError } from "@/lib/content/parsers/web-parser";
import { slugify } from "@/lib/utils/slug";
import { z } from "zod";

const importSchema = z.object({
  url: z.string().url("Invalid URL"),
});

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Plan limit: FREE = 5 articles/month
  if (user.plan === "FREE") {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const recentImports = await db.contentSource.count({
      where: {
        course: { uploadedBy: user.id },
        sourceType: "web",
        createdAt: { gte: monthAgo },
      },
    });
    if (recentImports >= 5) {
      return NextResponse.json(
        { error: "Free plan limited to 5 articles/month. Upgrade for more." },
        { status: 403 },
      );
    }
  }

  const body = await req.json().catch(() => ({}));
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const article = await parseWebArticle(parsed.data.url);

    // Get or create the user's "Web Articles" course
    const collectionId = `web-articles-${user.id}`;
    let course = await db.course.findFirst({ where: { collectionId } });

    if (!course) {
      course = await db.course.create({
        data: {
          id: collectionId,
          title: "Web Articles",
          description: "Saved web articles",
          collectionId,
          totalParts: 1,
          totalChapters: 0,
          isPublished: false,
          uploadedBy: user.id,
        },
      });
      await db.part.create({
        data: {
          courseId: course.id,
          number: 1,
          romanNumeral: "I",
          title: "Articles",
          sortOrder: 0,
        },
      });
    }

    const part = await db.part.findFirst({
      where: { courseId: course.id },
      orderBy: { sortOrder: "asc" },
    });
    if (!part) return NextResponse.json({ error: "Failed to find course part" }, { status: 500 });

    // Count existing chapters to get next number
    const existingCount = await db.chapter.count({ where: { courseId: course.id } });
    const chapterNumber = existingCount + 1;
    const slug = slugify(`${chapterNumber}-${article.title}`);
    const wordCount = article.content.split(/\s+/).length;

    await db.chapter.create({
      data: {
        partId: part.id,
        courseId: course.id,
        number: chapterNumber,
        title: article.title,
        slug,
        rawContent: article.content,
        wordCount,
        readingTimeMin: Math.max(1, Math.round(wordCount / 200)),
        sortOrder: chapterNumber - 1,
      },
    });

    // Update course chapter count
    await db.course.update({
      where: { id: course.id },
      data: { totalChapters: chapterNumber },
    });

    // Record content source
    await db.contentSource.create({
      data: {
        courseId: course.id,
        sourceType: "web",
        originalUrl: parsed.data.url,
      },
    });

    return NextResponse.json(
      {
        success: true,
        courseId: course.id,
        title: article.title,
        wordCount,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof UnsafeUrlError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Failed to import article";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
