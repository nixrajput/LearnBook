import type { Metadata } from "next";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllPlans } from "@/lib/plans";
import { PricingPageClient } from "@/components/pricing/pricing-page-client";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for LearnBook.",
};

export default async function PricingPage() {
  const [plans, session] = await Promise.all([getAllPlans(), auth()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      {/* Header */}
      <div className="mb-14 text-center">
        <div className="mb-4 inline-flex animate-fade-in items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Plans for every learner</span>
        </div>
        <h1 className="mb-4 animate-slide-up text-4xl font-bold tracking-tight md:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="stagger-1 animate-slide-up text-lg text-muted-foreground">
          Start free. Upgrade when you need more power.
        </p>
      </div>

      {/* Client component handles billing toggle, offers, and plan cards */}
      <PricingPageClient
        plans={plans}
        currentPlan={session?.user?.plan}
        locale={session?.user?.locale ?? "en-US"}
      />

      {/* CTA */}
      <div className="mt-16 animate-slide-up text-center">
        <p className="mb-4 text-muted-foreground">
          Questions? All plans include a 14-day money-back guarantee.
        </p>
        {session?.user ? (
          <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/20">
            <Link href="/dashboard">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/20">
            <Link href="/login">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
