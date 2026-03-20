import { db } from "@/lib/db";
import { AdminUserTable } from "@/components/admin/user-table";

const PAGE_SIZE = 50;

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      plan: true,
      locale: true,
      createdAt: true,
      stripeSubscriptionId: true,
      _count: { select: { notes: true, bookmarks: true, highlights: true, flashcardDecks: true } },
      aiCreditBalance: { select: { credits: true } },
    },
  });

  const totalCount = await db.user.count();
  const planCounts = await db.user.groupBy({ by: ["plan"], _count: true });
  const planSummary: Record<string, number> = {};
  for (const p of planCounts) planSummary[p.plan] = p._count;

  const data = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role,
    plan: u.plan,
    locale: u.locale,
    createdAt: u.createdAt.toISOString(),
    hasSubscription: !!u.stripeSubscriptionId,
    notesCount: u._count.notes,
    bookmarksCount: u._count.bookmarks,
    highlightsCount: u._count.highlights,
    flashcardDecks: u._count.flashcardDecks,
    aiCredits: u.aiCreditBalance?.credits ?? null,
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            {totalCount} total · {planSummary["FREE"] ?? 0} free · {planSummary["PRO"] ?? 0} pro ·{" "}
            {planSummary["PREMIUM"] ?? 0} premium
          </p>
        </div>
      </div>
      <AdminUserTable users={data} />
    </div>
  );
}
