import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { SUPPORTED_LOCALES, SUPPORTED_LANGUAGES } from "@/config/locales";

export async function PUT(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { locale, primaryLanguage } = body as {
    locale?: string;
    primaryLanguage?: string;
  };

  const data: Record<string, string> = {};

  if (locale) {
    if (!SUPPORTED_LOCALES.some((l) => l.code === locale)) {
      return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
    }
    data.locale = locale;
  }

  if (primaryLanguage) {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === primaryLanguage)) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }
    data.primaryLanguage = primaryLanguage;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data,
    select: { locale: true, primaryLanguage: true },
  });

  return NextResponse.json(updated);
}
