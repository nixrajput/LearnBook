import type { PrismaClient } from "@prisma/client";
import { parseMarkdownFile, getCourseDescription, getCourseManifest } from "./parser";

export interface SeedCourseOptions {
  manifestPath?: string;
  filePath?: string;
  uploadedBy?: string;
  isPublished?: boolean;
}

/**
 * Seeds a course into the database from a manifest + markdown file.
 * Extracted from prisma/seed.ts so it can be reused by the admin upload API.
 */
export async function seedCourse(
  db: PrismaClient,
  options: SeedCourseOptions = {},
): Promise<{ courseId: string; partsCount: number; chaptersCount: number; sectionsCount: number }> {
  const manifest = getCourseManifest(options.manifestPath);
  const courseId = manifest.id;

  const parts = parseMarkdownFile(options.filePath);
  const totalChapters = parts.reduce((sum, p) => sum + p.chapters.length, 0);
  const description = manifest.description || getCourseDescription(options.filePath);

  const course = await db.course.upsert({
    where: { id: courseId },
    update: {
      title: manifest.title,
      description,
      totalParts: parts.length,
      totalChapters,
      isPublished: options.isPublished ?? false,
      uploadedBy: options.uploadedBy ?? null,
    },
    create: {
      id: courseId,
      collectionId: courseId,
      title: manifest.title,
      description,
      totalParts: parts.length,
      totalChapters,
      isPublished: options.isPublished ?? false,
      uploadedBy: options.uploadedBy ?? null,
    },
  });

  let totalSections = 0;

  for (const part of parts) {
    const partRecord = await db.part.upsert({
      where: { courseId_number: { courseId: course.id, number: part.number } },
      update: {
        title: part.title,
        romanNumeral: part.romanNumeral,
        sortOrder: part.number,
      },
      create: {
        courseId: course.id,
        number: part.number,
        romanNumeral: part.romanNumeral,
        title: part.title,
        sortOrder: part.number,
      },
    });

    for (const chapter of part.chapters) {
      const chapterRecord = await db.chapter.upsert({
        where: { courseId_slug: { courseId: course.id, slug: chapter.slug } },
        update: {
          title: chapter.title,
          number: chapter.number,
          rawContent: chapter.rawContent,
          wordCount: chapter.wordCount,
          readingTimeMin: chapter.readingTimeMin,
          sortOrder: chapter.number,
        },
        create: {
          partId: partRecord.id,
          courseId: course.id,
          number: chapter.number,
          title: chapter.title,
          slug: chapter.slug,
          rawContent: chapter.rawContent,
          wordCount: chapter.wordCount,
          readingTimeMin: chapter.readingTimeMin,
          sortOrder: chapter.number,
        },
      });

      await db.section.deleteMany({ where: { chapterId: chapterRecord.id } });
      for (const section of chapter.sections) {
        await db.section.create({
          data: {
            chapterId: chapterRecord.id,
            heading: section.heading,
            slug: section.slug,
            level: section.level,
            content: section.content,
            sortOrder: section.sortOrder,
          },
        });
        totalSections++;
      }
    }
  }

  return {
    courseId: course.id,
    partsCount: parts.length,
    chaptersCount: totalChapters,
    sectionsCount: totalSections,
  };
}

/**
 * Seeds the default PlanConfig rows (FREE, PRO, PREMIUM).
 * Safe to call multiple times — uses upsert by planKey.
 */
export async function seedPlanConfigs(db: PrismaClient): Promise<void> {
  const plans = [
    {
      planKey: "FREE",
      name: "Starter",
      priceMonthly: 0,
      priceYearly: 0,
      features: JSON.stringify([
        "3 courses", // 0: Courses
        "50 notes, 25 bookmarks, 50 highlights", // 1: Notes, Bookmarks, Highlights
        "2 PDF/EPUB uploads", // 2: PDF/EPUB Uploads
        "5 web articles/month", // 3: Web Articles
        "100 AI credits/month (budget models)", // 4: AI Credits/month
        "3 flashcard decks (100 cards)", // 5: Flashcard Decks
        "Basic analytics", // 6: Analytics
        false, // 7: AI Study Sessions
        false, // 8: Knowledge Graph
        "Join 1 study group", // 9: Study Groups
        false, // 10: Export & Support
      ]),
      maxNotes: 50,
      maxBookmarks: 25,
      maxHighlights: 50,
      maxCourses: 3,
      sortOrder: 0,
    },
    {
      planKey: "PRO",
      name: "Pro",
      priceMonthly: 499,
      priceYearly: 4999,
      features: JSON.stringify([
        "Unlimited courses", // 0: Courses
        "Unlimited notes, bookmarks, highlights", // 1: Notes, Bookmarks, Highlights
        "20 PDF/EPUB uploads", // 2: PDF/EPUB Uploads
        "50 web articles/month", // 3: Web Articles
        "1,500 AI credits/month (budget + standard)", // 4: AI Credits/month
        "Unlimited flashcard decks", // 5: Flashcard Decks
        "Full analytics + reading goals", // 6: Analytics
        "AI Study Sessions", // 7: AI Study Sessions
        "Knowledge graph (view only)", // 8: Knowledge Graph
        "Create 2 study groups, join 5", // 9: Study Groups
        "Markdown export + email support", // 10: Export & Support
      ]),
      maxNotes: -1,
      maxBookmarks: -1,
      maxHighlights: -1,
      maxCourses: -1,
      sortOrder: 1,
    },
    {
      planKey: "PREMIUM",
      name: "Premium",
      priceMonthly: 999,
      priceYearly: 9999,
      features: JSON.stringify([
        "Unlimited + exclusive courses", // 0: Courses
        "Unlimited notes, bookmarks, highlights", // 1: Notes, Bookmarks, Highlights
        "Unlimited PDF/EPUB uploads", // 2: PDF/EPUB Uploads
        "Unlimited web articles", // 3: Web Articles
        "10,000 AI credits/month (all models)", // 4: AI Credits/month
        "Unlimited flashcard decks", // 5: Flashcard Decks
        "Advanced analytics + speed trends", // 6: Analytics
        "AI Study Sessions", // 7: AI Study Sessions
        "Full knowledge graph", // 8: Knowledge Graph
        "Create 10 groups (50 members each)", // 9: Study Groups
        "All export formats + priority support", // 10: Export & Support
      ]),
      maxNotes: -1,
      maxBookmarks: -1,
      maxHighlights: -1,
      maxCourses: -1,
      sortOrder: 2,
    },
  ];

  for (const plan of plans) {
    await db.planConfig.upsert({
      where: { planKey: plan.planKey },
      update: plan,
      create: plan,
    });
  }
}
