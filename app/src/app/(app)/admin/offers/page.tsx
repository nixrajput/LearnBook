import { db } from "@/lib/db";
import { AdminOfferList } from "@/components/admin/offer-list";

export default async function AdminOffersPage() {
  const offers = await db.offer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });

  const data = offers.map((o) => ({
    id: o.id,
    code: o.code,
    description: o.description,
    discountPercent: o.discountPercent,
    applicablePlans: o.applicablePlans,
    maxRedemptions: o.maxRedemptions,
    currentRedemptions: o._count.redemptions,
    isActive: o.isActive,
    validFrom: o.validFrom.toISOString(),
    validUntil: o.validUntil?.toISOString() ?? null,
  }));

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Offer Management</h2>
      <AdminOfferList offers={data} />
    </div>
  );
}
