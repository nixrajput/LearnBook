import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { Users, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Study Groups" };

export default async function GroupsPage() {
  const user = await requireSession();

  const memberships = await db.groupMember.findMany({
    where: { userId: user.id },
    include: {
      group: { include: { _count: { select: { members: true } } } },
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
          <p className="mt-1 text-muted-foreground">
            {memberships.length} group{memberships.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/groups/join">Join Group</Link>
          </Button>
          <Button asChild className="gap-1.5">
            <Link href="/groups/create">
              <Plus className="h-4 w-4" /> Create
            </Link>
          </Button>
        </div>
      </div>

      {memberships.length === 0 ? (
        <div className="rounded-xl border bg-card py-16 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <h2 className="mb-1 text-lg font-medium">No groups yet</h2>
          <p className="text-sm text-muted-foreground">
            Create a group or join one with an invite code.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {memberships.map(({ group, role }) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium group-hover:text-primary">{group.name}</h3>
                  <Badge variant="outline" className="text-[10px]">
                    {role}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {group._count.members} member{group._count.members !== 1 ? "s" : ""}
                  {group.description && <> · {group.description}</>}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
