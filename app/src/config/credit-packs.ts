import { db } from "@/lib/db";

export interface CreditPack {
  id: string;
  packKey: string;
  name: string;
  credits: number;
  price: number;
  popular: boolean;
  isActive: boolean;
}

/** Hardcoded defaults in case DB is empty */
const DEFAULT_PACKS: CreditPack[] = [
  {
    id: "default-1",
    packKey: "pack-100",
    name: "Starter",
    credits: 100,
    price: 49,
    popular: false,
    isActive: true,
  },
  {
    id: "default-2",
    packKey: "pack-500",
    name: "Popular",
    credits: 500,
    price: 199,
    popular: true,
    isActive: true,
  },
  {
    id: "default-3",
    packKey: "pack-1500",
    name: "Power",
    credits: 1500,
    price: 499,
    popular: false,
    isActive: true,
  },
  {
    id: "default-4",
    packKey: "pack-5000",
    name: "Mega",
    credits: 5000,
    price: 1499,
    popular: false,
    isActive: true,
  },
];

/** Load all active credit packs from DB, falling back to defaults. */
export async function getAllCreditPacks(): Promise<CreditPack[]> {
  try {
    const packs = await db.creditPack.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (packs.length === 0) return DEFAULT_PACKS;
    return packs;
  } catch {
    return DEFAULT_PACKS;
  }
}
