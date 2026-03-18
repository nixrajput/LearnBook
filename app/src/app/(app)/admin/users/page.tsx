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
      createdAt: true,
      _count: { select: { notes: true, bookmarks: true } },
    },
  });

  const totalCount = await db.user.count();

  const data = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role,
    plan: u.plan,
    createdAt: u.createdAt.toISOString(),
    notesCount: u._count.notes,
    bookmarksCount: u._count.bookmarks,
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Management</h2>
        <span className="text-sm text-muted-foreground">{totalCount} total users</span>
      </div>
      <AdminUserTable users={data} />
    </div>
  );
}
