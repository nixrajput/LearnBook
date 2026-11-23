import { redirect } from "next/navigation";
import { getActiveCourseId } from "@/lib/content/parser";
import { requireSession } from "@/lib/auth/session";

export default async function CourseRedirectPage() {
  const user = await requireSession();
  const courseId = await getActiveCourseId(user.id);
  redirect(`/courses/${courseId}`);
}
