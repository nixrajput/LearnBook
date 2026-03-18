import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
      createdAt: true,
    },
  });

  if (!user) return null;

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
