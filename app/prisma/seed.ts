import { PrismaClient } from "@prisma/client";
import { seedCourse, seedPlanConfigs } from "../src/lib/content/seeder";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...\n");

  // Seed default plan configs
  await seedPlanConfigs(prisma);
  console.log("✅ Plan configs seeded (FREE, PRO, PREMIUM)");

  // Seed course content
  const result = await seedCourse(prisma, { isPublished: true });
  console.log(`✅ Course seeded: ${result.courseId}`);
  console.log(
    `   ${result.partsCount} parts | ${result.chaptersCount} chapters | ${result.sectionsCount} sections`,
  );

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
