import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

/**
 * Validates admin role from the database (not the session token).
 * This prevents stale-session bypasses when a user's role has been changed.
 * Returns the user if admin, or a 403 NextResponse if not.
 */
export async function requireAdmin(): Promise<
  | { user: { id: string; role: string; plan: string; [key: string]: unknown }; error?: never }
  | { user?: never; error: NextResponse }
> {
  const sessionUser = await requireApiSession();
  if (!sessionUser) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // Fresh role check from database
  const dbUser = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user: { ...sessionUser, role: dbUser.role } as never };
}
