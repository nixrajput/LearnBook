import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CreditCard, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { getPlanLimits, formatPrice, getAllPlans } from "@/lib/plans";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/profile/profile-form";
import { ActiveSessions } from "@/components/profile/active-sessions";
import { DeleteAccountSection } from "@/components/profile/delete-account-section";

export const metadata: Metadata = { title: "Profile" };

const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-muted text-muted-foreground",
  PRO: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PREMIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

export default async function ProfilePage() {
  const sessionUser = await requireSession();

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      image: true,
      bio: true,
      role: true,
      plan: true,
      planExpiresAt: true,
      stripeCustomerId: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const plans = await getAllPlans();
  const currentPlanInfo = plans.find((p) => p.planKey === (user.plan ?? "FREE"));
  const limits = await getPlanLimits(user.plan ?? "FREE");
  const [notesCount, bookmarksCount, highlightsCount] = await Promise.all([
    db.note.count({ where: { userId: user.id } }),
    db.bookmark.count({ where: { userId: user.id } }),
    db.highlight.count({ where: { userId: user.id } }),
  ]);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.[0]?.toUpperCase() ?? "U");

  const plan = user.plan ?? "FREE";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Profile</h1>

      {/* Avatar + identity (read-only from OAuth) */}
      <section className="mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{user.displayName ?? user.name ?? "User"}</h2>
              <Badge className={`text-[10px] ${PLAN_COLORS[plan] ?? PLAN_COLORS.FREE}`}>
                {plan}
              </Badge>
              {user.role === "ADMIN" && (
                <Badge variant="outline" className="text-[10px]">
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Editable profile fields */}
      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold">Edit Profile</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Update your display name and bio. Your avatar and email come from your OAuth provider.
        </p>
        <ProfileForm
          initialDisplayName={user.displayName ?? user.name ?? ""}
          initialBio={user.bio ?? ""}
        />
      </section>

      <Separator className="my-8" />

      {/* Plan & Usage */}
      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold">Plan & Usage</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Manage your subscription and view resource usage.
        </p>

        <div className="rounded-lg border bg-card">
          {/* Current plan header */}
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{currentPlanInfo?.name ?? "Starter"}</span>
                  <Badge className={`text-[10px] ${PLAN_COLORS[plan] ?? PLAN_COLORS.FREE}`}>
                    {plan}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {plan === "FREE"
                    ? "Free forever"
                    : `${formatPrice(currentPlanInfo?.priceMonthly ?? 0)}/month`}
                  {user.planExpiresAt &&
                    ` · Renews ${new Date(user.planExpiresAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            {plan === "FREE" ? (
              <Button asChild size="sm">
                <Link href="/pricing">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Upgrade
                </Link>
              </Button>
            ) : (
              <ManageSubscriptionButton />
            )}
          </div>

          {/* Usage stats */}
          {(limits.maxNotes !== -1 ||
            limits.maxBookmarks !== -1 ||
            limits.maxHighlights !== -1) && (
            <div className="px-5 py-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Resource Usage
              </p>
              <div className="space-y-3">
                {limits.maxNotes !== -1 && (
                  <UsageBar label="Notes" current={notesCount} limit={limits.maxNotes} />
                )}
                {limits.maxBookmarks !== -1 && (
                  <UsageBar
                    label="Bookmarks"
                    current={bookmarksCount}
                    limit={limits.maxBookmarks}
                  />
                )}
                {limits.maxHighlights !== -1 && (
                  <UsageBar
                    label="Highlights"
                    current={highlightsCount}
                    limit={limits.maxHighlights}
                  />
                )}
              </div>
              <div className="mt-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Compare plans <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Unlimited message for paid users */}
          {limits.maxNotes === -1 && limits.maxBookmarks === -1 && limits.maxHighlights === -1 && (
            <div className="px-5 py-4 text-sm text-muted-foreground">
              All resources are unlimited on your plan.
            </div>
          )}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Active sessions */}
      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold">Active Sessions</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Manage your active login sessions. Revoking a session will require re-authentication on
          that device.
        </p>
        <ActiveSessions />
      </section>

      <Separator className="my-8" />

      {/* Delete account */}
      <section>
        <h2 className="mb-1 text-lg font-semibold text-destructive">Danger Zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <DeleteAccountSection />
      </section>
    </div>
  );
}

/* ── Helper components ────────────────────────────────────────────────── */

function UsageBar({ label, current, limit }: { label: string; current: number; limit: number }) {
  const pct = Math.min(100, Math.round((current / limit) * 100));
  const atLimit = current >= limit;
  const nearLimit = pct >= 80;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm">{label}</span>
        <span
          className={`text-xs font-medium tabular-nums ${
            atLimit
              ? "text-destructive"
              : nearLimit
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
          }`}
        >
          {current} / {limit}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
            atLimit ? "bg-destructive" : nearLimit ? "bg-amber-500" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ManageSubscriptionButton() {
  return (
    <form action="/api/stripe/portal" method="POST">
      <Button type="submit" variant="outline" size="sm">
        Manage Subscription
      </Button>
    </form>
  );
}
