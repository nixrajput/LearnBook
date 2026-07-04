import { redirect } from "next/navigation";
import { getActiveCourseId } from "@/lib/content/parser";

export default async function CourseRedirectPage() {
  const courseId = await getActiveCourseId();
  redirect(`/courses/${courseId}`);
}
