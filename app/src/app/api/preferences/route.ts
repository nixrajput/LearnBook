import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updatePreferencesSchema } from "@/lib/validators/preferences";
import { requireApiSession } from "@/lib/auth/session";

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prefs = await db.userPreference.findUnique({ where: { userId: user.id } });
  return NextResponse.json(prefs);
}

export async function PUT(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = updatePreferencesSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const prefs = await db.userPreference.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { userId: user.id, ...parsed.data },
  });
  return NextResponse.json(prefs);
}
