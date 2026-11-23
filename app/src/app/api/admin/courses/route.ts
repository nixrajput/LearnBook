import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, resolve, basename } from "path";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { validateCourseUpload } from "@/lib/content/validator";
import { seedCourse } from "@/lib/content/seeder";

const MAX_SIZE_MB = parseInt(process.env.MAX_COURSE_FILE_SIZE_MB ?? "50", 10);
const UPLOAD_PATH = process.env.COURSE_UPLOAD_PATH ?? "../courses/uploads";

/** GET — list all courses (including unpublished) for admin */
export async function GET() {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const user = result.user;

  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { parts: true, notes: true, bookmarks: true } },
    },
  });

  return NextResponse.json(courses);
}

/** POST — upload a new course (multipart: manifest.json + .md file) */
export async function POST(req: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const user = result.user;

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const manifestFile = formData.get("manifest") as File | null;
  const markdownFile = formData.get("markdown") as File | null;

  if (!manifestFile || !markdownFile) {
    return NextResponse.json(
      { error: "Both manifest.json and .md file are required" },
      { status: 400 },
    );
  }

  // Validate file types
  if (!manifestFile.name.endsWith(".json")) {
    return NextResponse.json({ error: "Manifest must be a .json file" }, { status: 400 });
  }
  if (!markdownFile.name.endsWith(".md")) {
    return NextResponse.json({ error: "Content must be a .md file" }, { status: 400 });
  }

  // Validate file sizes
  const MAX_MANIFEST_BYTES = 1 * 1024 * 1024; // 1MB cap for manifest
  if (manifestFile.size > MAX_MANIFEST_BYTES) {
    return NextResponse.json({ error: "Manifest file exceeds 1MB limit" }, { status: 400 });
  }
  const maxBytes = MAX_SIZE_MB * 1024 * 1024;
  if (markdownFile.size > maxBytes) {
    return NextResponse.json(
      { error: `Markdown file exceeds maximum size of ${MAX_SIZE_MB}MB` },
      { status: 400 },
    );
  }

  // Read file contents
  const manifestText = await manifestFile.text();
  const markdownText = await markdownFile.text();

  // Validate content
  const validation = validateCourseUpload(manifestText, markdownText);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 400 },
    );
  }

  const manifest = validation.manifest!;

  // Check for duplicate collectionId
  const existing = await db.course.findFirst({
    where: { collectionId: manifest.id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Course with this ID already exists. Use update instead." },
      { status: 409 },
    );
  }

  // Write files to upload directory
  const uploadDir = resolve(process.cwd(), UPLOAD_PATH, manifest.id);
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const manifestPath = join(uploadDir, "manifest.json");
  const mdFileName = basename(manifest.entryFile ?? markdownFile.name);
  const mdPath = join(uploadDir, mdFileName);

  writeFileSync(manifestPath, manifestText, "utf-8");
  writeFileSync(mdPath, markdownText, "utf-8");

  // If manifest didn't specify entryFile, update it
  if (!manifest.entryFile) {
    const updatedManifest = { ...manifest, entryFile: mdFileName };
    writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2), "utf-8");
  }

  // Seed the course into the database
  try {
    const result = await seedCourse(db, {
      manifestPath: uploadDir,
      filePath: mdPath,
      uploadedBy: user.id,
      isPublished: false,
    });

    return NextResponse.json(
      {
        success: true,
        courseId: result.courseId,
        partsCount: result.partsCount,
        chaptersCount: result.chaptersCount,
        sectionsCount: result.sectionsCount,
      },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to process course", details: String(e) },
      { status: 500 },
    );
  }
}
