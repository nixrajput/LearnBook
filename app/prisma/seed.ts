import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { seedCourse, seedPlanConfigs, seedCreditPacks } from "../src/lib/content/seeder";
import { sqliteUrl } from "../src/lib/sqlite-url";

try {
  process.loadEnvFile();
} catch {
  // No .env file: DATABASE_URL comes from the environment.
}

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: sqliteUrl() }) });

async function main() {
  console.log("🌱 Starting seed...\n");

  // Seed default plan configs
  await seedPlanConfigs(prisma);
  console.log("✅ Plan configs seeded (FREE, PRO, PREMIUM)");

  // Seed credit packs
  await seedCreditPacks(prisma);
  console.log("✅ Credit packs seeded");

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
