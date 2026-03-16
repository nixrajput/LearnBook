import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updatePreferencesSchema } from "@/lib/validators/preferences";

export async function GET() {
  const prefs = await db.userPreference.findUnique({ where: { id: "default" } });
  return NextResponse.json(prefs);
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = updatePreferencesSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const prefs = await db.userPreference.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });
  return NextResponse.json(prefs);
}
