import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { InviteLinkShare } from "@/components/groups/invite-link-share";
import { Leaderboard } from "@/components/groups/leaderboard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({ params }: PageProps) {
  const user = await requireSession();
  const { id } = await params;

  const member = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });
  if (!member) notFound();

  const group = await db.studyGroup.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true, email: true } } },
      },
    },
  });
  if (!group) notFound();

  // Build leaderboard from member progress
  const leaderboardEntries = await Promise.all(
    group.members.map(async (m) => {
      const chaptersCompleted = await db.readingProgress.count({
        where: { userId: m.userId, courseId: group.courseId, completed: true },
      });
      return {
        userId: m.userId,
        name: m.user.name,
        image: m.user.image,
        chaptersCompleted,
        score: chaptersCompleted * 10, // Simple scoring: 10 points per chapter
      };
    }),
  );

  const isOwner = member.role === "OWNER";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
          <Badge variant="outline" className="text-[10px]">
            {member.role}
          </Badge>
        </div>
        {group.description && (
          <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {group.members.length} member{group.members.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invite link */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Invite Link</h3>
          <InviteLinkShare groupId={id} inviteCode={group.inviteCode} isOwner={isOwner} />
        </div>

        {/* Members */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4" />
            Members
          </h3>
          <div className="space-y-2">
            {group.members.map((m) => (
              <div key={m.userId} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={m.user.image ?? undefined} />
                  <AvatarFallback className="text-[10px]">
                    {m.user.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{m.user.name ?? m.user.email}</span>
                {m.role !== "MEMBER" && (
                  <Badge variant="outline" className="text-[8px]">
                    {m.role}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <Leaderboard entries={leaderboardEntries} />
        </div>
      </div>
    </div>
  );
}
