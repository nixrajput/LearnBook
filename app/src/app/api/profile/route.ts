import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validators/profile";

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      image: true,
      bio: true,
      role: true,
      plan: true,
      createdAt: true,
    },
  });

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      image: true,
      bio: true,
      role: true,
      plan: true,
    },
  });

  return NextResponse.json(updated);
}
