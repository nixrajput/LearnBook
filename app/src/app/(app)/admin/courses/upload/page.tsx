import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseUploadForm } from "@/components/admin/course-upload-form";

export default function AdminUploadPage() {
  return (
    <div>
      <Link
        href="/admin/courses"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Overview
      </Link>
      <h2 className="mb-1 text-lg font-semibold">Upload Course</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Upload a manifest.json and a markdown (.md) file to create a new course.
      </p>
      <CourseUploadForm />
    </div>
  );
}
