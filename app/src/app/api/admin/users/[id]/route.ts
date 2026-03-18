import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  plan: z.enum(["FREE", "PRO", "PREMIUM"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const user = result.user;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Prevent admin from removing their own admin role
  if (id === user.id && parsed.data.role === "USER") {
    return NextResponse.json({ error: "Cannot remove your own admin role" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = await db.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, plan: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const user = result.user;

  const { id } = await params;

  // Prevent admin from deleting themselves
  if (id === user.id) {
    return NextResponse.json(
      { error: "Cannot delete your own account from admin panel" },
      { status: 400 },
    );
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.user.delete({ where: { id } });

  return NextResponse.json({ success: true, message: `User "${target.email}" deleted` });
}
