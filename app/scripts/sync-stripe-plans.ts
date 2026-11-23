/**
 * Creates Stripe Products and Prices for each paid PlanConfig,
 * then stores the Stripe price IDs back in the database.
 *
 * Usage:  npx tsx scripts/sync-stripe-plans.ts
 * Requires: STRIPE_SECRET_KEY in .env
 *
 * Currency is controlled by STRIPE_CURRENCY env var (default: "inr").
 */

import "dotenv/config";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { sqliteUrl } from "../src/lib/sqlite-url";

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: sqliteUrl() }) });
const CURRENCY = process.env.STRIPE_CURRENCY ?? "inr";

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is not set in .env");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);

  const plans = await prisma.planConfig.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  console.log(`Found ${plans.length} plan configs (currency: ${CURRENCY})\n`);

  for (const plan of plans) {
    // Skip free plan — no Stripe product needed
    if (plan.priceMonthly === 0 && plan.priceYearly === 0) {
      console.log(`⏭  ${plan.name} (${plan.planKey}) — free, skipping`);
      continue;
    }

    // Already configured — skip
    if (plan.stripePriceIdMonthly && plan.stripePriceIdYearly) {
      console.log(
        `✅ ${plan.name} (${plan.planKey}) — already configured (monthly: ${plan.stripePriceIdMonthly}, yearly: ${plan.stripePriceIdYearly})`,
      );
      continue;
    }

    console.log(`🔧 ${plan.name} (${plan.planKey}) — creating in Stripe...`);

    // Check if a product already exists with this planKey in metadata
    const allProducts = await stripe.products.list({ limit: 100, active: true });
    const existing = allProducts.data.find((p) => p.metadata?.planKey === plan.planKey);

    let product: Stripe.Product;
    if (existing) {
      product = existing;
      console.log(`   Product already exists: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: `LearnBook ${plan.name}`,
        metadata: { planKey: plan.planKey },
      });
      console.log(`   Created product: ${product.id}`);
    }

    // Convert price to smallest currency unit for Stripe
    const monthlyUnit = Math.round(plan.priceMonthly * 100);
    const yearlyUnit = Math.round(plan.priceYearly * 100);

    // Create monthly price if not set
    let monthlyPriceId = plan.stripePriceIdMonthly;
    if (!monthlyPriceId) {
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: monthlyUnit,
        currency: CURRENCY,
        recurring: { interval: "month" },
        metadata: { planKey: plan.planKey, interval: "monthly" },
      });
      monthlyPriceId = monthlyPrice.id;
      console.log(`   Monthly price: ${monthlyPriceId} (₹${plan.priceMonthly}/mo)`);
    }

    // Create yearly price if not set
    let yearlyPriceId = plan.stripePriceIdYearly;
    if (!yearlyPriceId) {
      const yearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: yearlyUnit,
        currency: CURRENCY,
        recurring: { interval: "year" },
        metadata: { planKey: plan.planKey, interval: "yearly" },
      });
      yearlyPriceId = yearlyPrice.id;
      console.log(`   Yearly price:  ${yearlyPriceId} (₹${plan.priceYearly}/yr)`);
    }

    // Update the database with the price IDs
    await prisma.planConfig.update({
      where: { planKey: plan.planKey },
      data: {
        stripePriceIdMonthly: monthlyPriceId,
        stripePriceIdYearly: yearlyPriceId,
      },
    });

    console.log(`   ✅ Database updated\n`);
  }

  console.log("Done! Stripe price IDs are now stored in the database.");
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
