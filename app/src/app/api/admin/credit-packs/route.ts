import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";

const updatePackSchema = z.object({
  packKey: z.string(),
  name: z.string().min(1).optional(),
  credits: z.number().int().min(1).optional(),
  price: z.number().int().min(1).optional(),
  popular: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const body = await req.json().catch(() => ({}));
  const parsed = updatePackSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { packKey, ...data } = parsed.data;

  const pack = await db.creditPack.findUnique({ where: { packKey } });
  if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 });

  const updated = await db.creditPack.update({
    where: { packKey },
    data,
  });

  return NextResponse.json(updated);
}
