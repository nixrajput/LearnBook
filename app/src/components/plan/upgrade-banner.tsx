import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeBannerProps {
  /** The minimum plan required to unlock the feature. */
  requiredPlan: "PRO" | "PREMIUM";
  /** Short description of what the upgrade unlocks. */
  feature: string;
  className?: string;
}

const PLAN_LABEL: Record<string, string> = {
  PRO: "Pro",
  PREMIUM: "Premium",
};

export function UpgradeBanner({ requiredPlan, feature, className = "" }: UpgradeBannerProps) {
  const label = PLAN_LABEL[requiredPlan] ?? requiredPlan;

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm">
          <span className="font-medium">{feature}</span>{" "}
          <span className="text-muted-foreground">— available on {label}</span>
        </p>
      </div>
      <Button asChild size="sm" variant="outline" className="shrink-0">
        <Link href="/pricing">
          Upgrade
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}
