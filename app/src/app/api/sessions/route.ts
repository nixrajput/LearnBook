import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

/** Read the current session token from the auth cookie. */
async function getCurrentSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  // Auth.js v5 uses these cookie names for the session token
  return (
    cookieStore.get("authjs.session-token")?.value ??
    cookieStore.get("__Secure-authjs.session-token")?.value
  );
}

// GET /api/sessions — list all active sessions for current user
export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentToken = await getCurrentSessionToken();

  const sessions = await db.session.findMany({
    where: { userId: user.id },
    orderBy: { expires: "desc" },
    select: { id: true, sessionToken: true, expires: true },
  });

  // Mark which session is the current one, strip the token from output
  const result = sessions.map((s) => ({
    id: s.id,
    expires: s.expires,
    isCurrent: s.sessionToken === currentToken,
  }));

  return NextResponse.json({ sessions: result });
}

// DELETE /api/sessions — revoke session(s)
// Body: { sessionId: string } to revoke one, or { all: true } to revoke all except current
export async function DELETE(req: Request) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  if (body.all === true) {
    const currentToken = await getCurrentSessionToken();

    if (currentToken) {
      // Delete all sessions except the current one
      const currentSession = await db.session.findFirst({
        where: { userId: user.id, sessionToken: currentToken },
        select: { id: true },
      });
      await db.session.deleteMany({
        where: {
          userId: user.id,
          ...(currentSession ? { id: { not: currentSession.id } } : {}),
        },
      });
    } else {
      await db.session.deleteMany({ where: { userId: user.id } });
    }

    return NextResponse.json({ success: true, message: "Other sessions revoked" });
  }

  if (body.sessionId) {
    // Prevent revoking own current session
    const currentToken = await getCurrentSessionToken();
    const target = await db.session.findFirst({
      where: { id: body.sessionId, userId: user.id },
    });
    if (!target) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    if (target.sessionToken === currentToken) {
      return NextResponse.json(
        { error: "Cannot revoke your current session. Use sign out instead." },
        { status: 400 },
      );
    }

    await db.session.delete({ where: { id: body.sessionId } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Provide sessionId or all: true" }, { status: 400 });
}
