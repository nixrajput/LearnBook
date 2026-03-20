import { db } from "@/lib/db";
import { AdminCreditPackList } from "@/components/admin/credit-pack-list";

export default async function AdminCreditPacksPage() {
  const packs = await db.creditPack.findMany({ orderBy: { sortOrder: "asc" } });

  const data = packs.map((p) => ({
    id: p.id,
    packKey: p.packKey,
    name: p.name,
    credits: p.credits,
    price: p.price,
    popular: p.popular,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
  }));

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Credit Pack Management</h2>
        <p className="text-sm text-muted-foreground">
          Configure credit packs available for one-time purchase.
        </p>
      </div>
      <AdminCreditPackList packs={data} />
    </div>
  );
}
