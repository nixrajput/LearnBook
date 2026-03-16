import { PrismaClient } from "@prisma/client";
import { parseMarkdownFile, getCourseDescription, getNotesManifest } from "../src/lib/content/parser";

const prisma = new PrismaClient();

async function main() {
  const manifest = getNotesManifest();
  const courseId = manifest.id;

  console.log(`🌱 Seeding collection: "${manifest.title}" (id: ${courseId})`);

  const parts = parseMarkdownFile();
  const totalChapters = parts.reduce((sum, p) => sum + p.chapters.length, 0);
  const description = manifest.description || getCourseDescription();

  const course = await prisma.course.upsert({
    where: { id: courseId },
    update: { title: manifest.title, description, totalParts: parts.length, totalChapters },
    create: {
      id: courseId,
      collectionId: courseId,
      title: manifest.title,
      description,
      totalParts: parts.length,
      totalChapters,
    },
  });

  console.log(`✅ Course: ${course.title} (${parts.length} parts, ${totalChapters} chapters)`);

  for (const part of parts) {
    const partRecord = await prisma.part.upsert({
      where: { courseId_number: { courseId: course.id, number: part.number } },
      update: { title: part.title, romanNumeral: part.romanNumeral, sortOrder: part.number },
      create: {
        courseId: course.id,
        number: part.number,
        romanNumeral: part.romanNumeral,
        title: part.title,
        sortOrder: part.number,
      },
    });

    console.log(`  📚 Part ${part.romanNumeral}: ${part.title} (${part.chapters.length} chapters)`);

    for (const chapter of part.chapters) {
      const chapterRecord = await prisma.chapter.upsert({
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

      await prisma.section.deleteMany({ where: { chapterId: chapterRecord.id } });
      for (const section of chapter.sections) {
        await prisma.section.create({
          data: {
            chapterId: chapterRecord.id,
            heading: section.heading,
            slug: section.slug,
            level: section.level,
            content: section.content,
            sortOrder: section.sortOrder,
          },
        });
      }
    }
  }

  const existingPrefs = await prisma.userPreference.findUnique({ where: { id: "default" } });
  await prisma.userPreference.upsert({
    where: { id: "default" },
    update: existingPrefs?.activeCourseId ? {} : { activeCourseId: course.id },
    create: { id: "default", activeCourseId: course.id },
  });
  if (!existingPrefs?.activeCourseId) {
    console.log(`✅ Set active course to: ${course.id}`);
  }

  const totalSections = parts.reduce(
    (sum, p) => sum + p.chapters.reduce((cs, c) => cs + c.sections.length, 0), 0
  );

  console.log(`\n✅ Seed complete!`);
  console.log(`   ${parts.length} parts | ${totalChapters} chapters | ${totalSections} sections`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
