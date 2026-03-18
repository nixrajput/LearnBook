"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  plan: string;
  createdAt: string;
  notesCount: number;
  bookmarksCount: number;
}

const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-muted text-muted-foreground",
  PRO: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PREMIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

export function AdminUserTable({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleRole(id: string, currentRole: string) {
    setLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentRole === "ADMIN" ? "USER" : "ADMIN" }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to update role");
      }
    } finally {
      setLoading(null);
    }
  }

  async function deleteUser(id: string, email: string) {
    if (!confirm(`Delete user "${email}"? This permanently removes all their data.`)) return;
    setLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to delete user");
      }
    } finally {
      setLoading(null);
    }
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-12 text-center">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {error && (
        <div className="border-b bg-destructive/5 px-4 py-2 text-xs text-destructive">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                User
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Plan
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Notes
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Bookmarks
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b transition-colors last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {u.name?.[0]?.toUpperCase() ?? u.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{u.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge className={`text-[10px] ${PLAN_COLORS[u.plan] ?? PLAN_COLORS.FREE}`}>
                    {u.plan}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant={u.role === "ADMIN" ? "default" : "outline"}
                    className="text-[10px]"
                  >
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums">{u.notesCount}</td>
                <td className="px-4 py-3 text-center text-sm tabular-nums">{u.bookmarksCount}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRole(u.id, u.role)}
                      disabled={loading === u.id}
                      title={u.role === "ADMIN" ? "Remove admin" : "Make admin"}
                    >
                      {loading === u.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : u.role === "ADMIN" ? (
                        <ShieldOff className="h-3.5 w-3.5" />
                      ) : (
                        <Shield className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteUser(u.id, u.email)}
                      disabled={loading === u.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
