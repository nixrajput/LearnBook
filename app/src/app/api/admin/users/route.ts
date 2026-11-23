import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const user = result.user;

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10));
  const search = req.nextUrl.searchParams.get("search")?.trim();
  const skip = (page - 1) * PAGE_SIZE;

  const where = search
    ? {
        OR: [{ name: { contains: search } }, { email: { contains: search } }],
      }
    : {};

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        plan: true,
        createdAt: true,
        _count: { select: { notes: true, bookmarks: true, readingProgress: true } },
      },
    }),
  ]);

  return NextResponse.json({
    users,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
