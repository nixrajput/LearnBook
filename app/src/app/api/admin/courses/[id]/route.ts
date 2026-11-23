import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

/** PATCH — publish/unpublish or edit course metadata */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const course = await db.course.findUnique({ where: { id } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};

  if (typeof body.isPublished === "boolean") {
    updateData.isPublished = body.isPublished;
  }
  if (typeof body.title === "string" && body.title.trim()) {
    updateData.title = body.title.trim();
  }
  if (typeof body.description === "string") {
    updateData.description = body.description.trim();
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await db.course.update({ where: { id }, data: updateData });
  return NextResponse.json(updated);
}

/** DELETE — remove a course and all its content (cascading) */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { id } = await params;

  const course = await db.course.findUnique({ where: { id } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // Cascade delete handles all parts, chapters, sections, progress, notes, etc.
  await db.course.delete({ where: { id } });

  return NextResponse.json({ success: true, message: `Course "${course.title}" deleted` });
}
