import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, resolve, basename } from "path";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { parsePdf } from "@/lib/content/parsers/pdf-parser";
import { parseEpub } from "@/lib/content/parsers/epub-parser";
import { slugify } from "@/lib/utils/slug";
import { MAX_UPLOAD_MB, MULTIPART_OVERHEAD_BYTES } from "@/lib/content/upload-limits";

const UPLOAD_PATH = process.env.COURSE_UPLOAD_PATH ?? "../courses/uploads";
const ALLOWED_TYPES = [".pdf", ".epub"];

export async function POST(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Plan limit: FREE = 2 uploads (checked before heavy processing; small race window accepted)
  if (user.plan === "FREE") {
    const uploadCount = await db.contentSource.count({
      where: { course: { uploadedBy: user.id }, sourceType: { in: ["pdf", "epub"] } },
    });
    if (uploadCount >= 2) {
      return NextResponse.json(
        { error: "Free plan limited to 2 uploads. Upgrade for more." },
        { status: 403 },
      );
    }
  }

  // formData() reads the whole body into memory, so refuse an oversized request before reading it.
  const maxBytes = MAX_UPLOAD_MB * 1024 * 1024;
  const declaredBytes = Number(req.headers.get("content-length"));
  if (!declaredBytes) {
    return NextResponse.json({ error: "Content-Length is required" }, { status: 411 });
  }
  if (declaredBytes > maxBytes + MULTIPART_OVERHEAD_BYTES) {
    return NextResponse.json({ error: `File exceeds ${MAX_UPLOAD_MB}MB limit` }, { status: 413 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_TYPES.includes(ext)) {
    return NextResponse.json(
      { error: `Only ${ALLOWED_TYPES.join(", ")} files are accepted` },
      { status: 400 },
    );
  }

  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File exceeds ${MAX_UPLOAD_MB}MB limit` }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate magic bytes to prevent extension spoofing
  if (ext === ".pdf" && buffer.slice(0, 4).toString("ascii") !== "%PDF") {
    return NextResponse.json({ error: "File content does not match PDF format" }, { status: 400 });
  }
  if (ext === ".epub" && !(buffer[0] === 0x50 && buffer[1] === 0x4b)) {
    return NextResponse.json({ error: "File content does not match EPUB format" }, { status: 400 });
  }

  const title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

  try {
    let chapters: { title: string; content: string }[] = [];

    if (ext === ".pdf") {
      const result = await parsePdf(buffer);
      chapters = result.chapters;
    } else if (ext === ".epub") {
      const result = await parseEpub(buffer);
      chapters = result.chapters;
    }

    if (chapters.length === 0) {
      const msg =
        ext === ".epub"
          ? "EPUB binary parsing is not yet supported. Please convert to markdown using Calibre and upload as a .md file via the admin panel."
          : "Could not extract content from file";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Create course
    const courseId = `user-${user.id}-${Date.now()}`;
    const course = await db.course.create({
      data: {
        id: courseId,
        title,
        description: `Imported from ${file.name}`,
        collectionId: courseId,
        totalParts: 1,
        totalChapters: chapters.length,
        isPublished: false,
        uploadedBy: user.id,
      },
    });

    // Create a single part
    const part = await db.part.create({
      data: {
        courseId,
        number: 1,
        romanNumeral: "I",
        title,
        sortOrder: 0,
      },
    });

    // Create chapters
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const slug = slugify(`${i + 1}-${ch.title}`);
      const wordCount = ch.content.split(/\s+/).length;

      await db.chapter.create({
        data: {
          partId: part.id,
          courseId,
          number: i + 1,
          title: ch.title,
          slug,
          rawContent: ch.content,
          wordCount,
          readingTimeMin: Math.max(1, Math.round(wordCount / 200)),
          sortOrder: i,
        },
      });
    }

    // Save original file
    const uploadDir = resolve(process.cwd(), UPLOAD_PATH, courseId);
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
    writeFileSync(join(uploadDir, basename(file.name)), buffer);

    // Record content source
    await db.contentSource.create({
      data: {
        courseId,
        sourceType: ext.slice(1), // "pdf" or "epub"
        filePath: join(uploadDir, basename(file.name)),
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json(
      {
        success: true,
        courseId,
        title,
        chapters: chapters.length,
      },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to process file", details: String(e) },
      { status: 500 },
    );
  }
}
