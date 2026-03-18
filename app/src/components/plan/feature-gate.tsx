import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAN_RANK: Record<string, number> = { FREE: 0, PRO: 1, PREMIUM: 2 };
const PLAN_LABEL: Record<string, string> = { PRO: "Pro", PREMIUM: "Premium" };

interface FeatureGateProps {
  /** User's current plan key. */
  currentPlan: string;
  /** The minimum plan required to see this content. */
  requiredPlan: "PRO" | "PREMIUM";
  /** Short description of the gated feature (shown in upgrade prompt). */
  feature: string;
  children: React.ReactNode;
  className?: string;
}

export function FeatureGate({
  currentPlan,
  requiredPlan,
  feature,
  children,
  className = "",
}: FeatureGateProps) {
  const current = PLAN_RANK[currentPlan] ?? 0;
  const required = PLAN_RANK[requiredPlan] ?? 1;

  if (current >= required) {
    return <>{children}</>;
  }

  const label = PLAN_LABEL[requiredPlan] ?? requiredPlan;

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-card ${className}`}>
      {/* Blurred content preview */}
      <div className="pointer-events-none select-none blur-[6px]" aria-hidden="true">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px]">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-muted-foreground/20 bg-muted shadow-sm">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-sm font-semibold">{feature}</h3>
        <p className="mb-4 max-w-xs text-center text-xs text-muted-foreground">
          Upgrade to {label} to unlock this feature
        </p>
        <Button asChild size="sm">
          <Link href="/pricing">
            Upgrade to {label}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
