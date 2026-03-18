import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Use in Server Components / Pages.
 * Redirects to /login if unauthenticated.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

/**
 * Use in API Route Handlers.
 * Returns null if unauthenticated (caller must return 401).
 */
export async function requireApiSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}
