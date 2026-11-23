import Link from "next/link";
import { Upload } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { AdminCourseTable } from "@/components/admin/course-table";

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { parts: true, progress: true, notes: true } },
      contentSources: { select: { sourceType: true, fileSize: true }, take: 1 },
    },
  });

  // Get unique enrolled users per course
  const enrollments = await db.readingProgress.groupBy({
    by: ["courseId", "userId"],
    where: { courseId: { in: courses.map((c) => c.id) } },
  });
  const enrolledByCourse = new Map<string, number>();
  const seen = new Map<string, Set<string>>();
  for (const row of enrollments) {
    if (!seen.has(row.courseId)) seen.set(row.courseId, new Set());
    seen.get(row.courseId)!.add(row.userId);
  }
  for (const [courseId, users] of seen) {
    enrolledByCourse.set(courseId, users.size);
  }

  const data = courses.map((c) => ({
    id: c.id,
    title: c.title,
    collectionId: c.collectionId,
    totalChapters: c.totalChapters,
    totalParts: c._count.parts,
    isPublished: c.isPublished,
    createdAt: c.createdAt.toISOString(),
    sourceType: c.contentSources[0]?.sourceType ?? "markdown",
    fileSize: c.contentSources[0]?.fileSize ?? null,
    enrolledUsers: enrolledByCourse.get(c.id) ?? 0,
    notesCount: c._count.notes,
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Course Management</h2>
          <p className="text-sm text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? "s" : ""} ·{" "}
            {courses.filter((c) => c.isPublished).length} published
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/admin/courses/upload">
            <Upload className="h-3.5 w-3.5" />
            Upload Course
          </Link>
        </Button>
      </div>
      <AdminCourseTable courses={data} />
    </div>
  );
}
