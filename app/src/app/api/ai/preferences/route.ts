import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getModelsForPlan, getModelDef } from "@/lib/ai/models";
import { z } from "zod";

const updateSchema = z.object({
  selectedModel: z.string().min(1),
});

export async function GET() {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pref = await db.aiPreference.findUnique({ where: { userId: user.id } });
  const available = getModelsForPlan(user.plan ?? "FREE");

  return NextResponse.json({
    selectedModel: pref?.selectedModel ?? "auto",
    availableModels: [
      { id: "auto", name: "Auto (recommended)" },
      ...available.map((m) => ({ id: m.id, name: m.name, tier: m.tier, multiplier: m.multiplier })),
    ],
  });
}

export async function PUT(req: NextRequest) {
  const user = await requireApiSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { selectedModel } = parsed.data;

  // Validate model is "auto" or available for user's plan
  if (selectedModel !== "auto") {
    const def = getModelDef(selectedModel);
    if (!def) return NextResponse.json({ error: "Unknown model" }, { status: 400 });

    const available = getModelsForPlan(user.plan ?? "FREE");
    if (!available.some((m) => m.id === selectedModel)) {
      return NextResponse.json({ error: "Model not available for your plan" }, { status: 403 });
    }
  }

  const pref = await db.aiPreference.upsert({
    where: { userId: user.id },
    update: { selectedModel },
    create: { userId: user.id, selectedModel },
  });

  return NextResponse.json({ selectedModel: pref.selectedModel });
}
