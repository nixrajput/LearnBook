"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Trash2,
  Shield,
  ShieldOff,
  Sparkles,
  Pencil,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  plan: string;
  locale: string | null;
  createdAt: string;
  hasSubscription: boolean;
  notesCount: number;
  bookmarksCount: number;
  highlightsCount: number;
  flashcardDecks: number;
  aiCredits: number | null;
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
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [roleToggleTarget, setRoleToggleTarget] = useState<UserRow | null>(null);
  const [filter, setFilter] = useState<"ALL" | "FREE" | "PRO" | "PREMIUM">("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "name" | "credits">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [creditEditTarget, setCreditEditTarget] = useState<UserRow | null>(null);
  const [creditEditValue, setCreditEditValue] = useState(0);
  const [creditSaving, setCreditSaving] = useState(false);
  const [creditConfirmOpen, setCreditConfirmOpen] = useState(false);

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  }

  const filtered = users
    .filter((u) => filter === "ALL" || u.plan === filter)
    .filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (u.name?.toLowerCase().includes(q) ?? false) || u.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return dir * (a.name ?? "").localeCompare(b.name ?? "");
      if (sortBy === "credits") return dir * ((a.aiCredits ?? 0) - (b.aiCredits ?? 0));
      return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

  async function handleCreditSave() {
    if (!creditEditTarget) return;
    setCreditSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: creditEditTarget.id, credits: creditEditValue }),
      });
      if (res.ok) {
        setCreditEditTarget(null);
        router.refresh();
      } else {
        setError((await res.json().catch(() => ({}))).error ?? "Failed to update credits");
      }
    } finally {
      setCreditSaving(false);
    }
  }

  async function handleRoleToggleConfirm() {
    if (!roleToggleTarget) return;
    setLoading(roleToggleTarget.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${roleToggleTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleToggleTarget.role === "ADMIN" ? "USER" : "ADMIN" }),
      });
      if (res.ok) router.refresh();
      else setError((await res.json().catch(() => ({}))).error ?? "Failed to update role");
    } finally {
      setLoading(null);
      setRoleToggleTarget(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setLoading(deleteTarget.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else setError((await res.json().catch(() => ({}))).error ?? "Failed to delete user");
    } finally {
      setLoading(null);
      setDeleteTarget(null);
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
    <div className="space-y-3">
      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="h-9 w-64 pl-9 text-sm"
          />
        </div>
        <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
          {(["ALL", "FREE", "PRO", "PREMIUM"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "ALL"
                ? `All (${users.length})`
                : `${f} (${users.filter((u) => u.plan === f).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {error && (
          <div className="border-b bg-destructive/5 px-4 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  <button
                    onClick={() => toggleSort("name")}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    User <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Plan
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  <button
                    onClick={() => toggleSort("credits")}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    AI Credits <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Content
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  <button
                    onClick={() => toggleSort("createdAt")}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    Joined <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b transition-colors last:border-0 hover:bg-muted/20"
                >
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
                    {u.hasSubscription && (
                      <div className="mt-0.5 text-[9px] text-emerald-600 dark:text-emerald-400">
                        active sub
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={u.role === "ADMIN" ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className="inline-flex items-center gap-1 text-sm tabular-nums transition-colors hover:text-primary"
                      onClick={() => {
                        setCreditEditTarget(u);
                        setCreditEditValue(u.aiCredits ?? 0);
                      }}
                      title="Click to adjust credits"
                    >
                      <Sparkles className="h-3 w-3 text-indigo-500" />
                      {u.aiCredits ?? "—"}
                      <Pencil className="h-2.5 w-2.5 text-muted-foreground/50" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-xs tabular-nums text-muted-foreground">
                      {u.notesCount}n · {u.bookmarksCount}b · {u.highlightsCount}h ·{" "}
                      {u.flashcardDecks}d
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRoleToggleTarget(u)}
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
                        onClick={() => setDeleteTarget(u)}
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

      <ConfirmDialog
        open={!!roleToggleTarget}
        onOpenChange={(open) => !open && setRoleToggleTarget(null)}
        title={roleToggleTarget?.role === "ADMIN" ? "Remove Admin Role" : "Grant Admin Role"}
        description={
          roleToggleTarget?.role === "ADMIN"
            ? `Remove admin privileges from "${roleToggleTarget?.email}"?`
            : `Grant admin privileges to "${roleToggleTarget?.email}"?`
        }
        confirmLabel={roleToggleTarget?.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
        variant={roleToggleTarget?.role === "ADMIN" ? "danger" : "warning"}
        onConfirm={handleRoleToggleConfirm}
        loading={loading === roleToggleTarget?.id}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User"
        description={`Permanently delete "${deleteTarget?.email}" and all their data? This cannot be undone.`}
        confirmLabel="Delete User"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        loading={loading === deleteTarget?.id}
      />

      {/* Credit adjustment dialog */}
      <Dialog open={!!creditEditTarget} onOpenChange={(open) => !open && setCreditEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust AI Credits</DialogTitle>
            <DialogDescription>
              Set credit balance for {creditEditTarget?.name ?? creditEditTarget?.email}. Current
              balance: {creditEditTarget?.aiCredits ?? 0} credits.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="credit-value" className="text-sm">
              New credit balance
            </Label>
            <Input
              id="credit-value"
              type="number"
              value={creditEditValue}
              onChange={(e) => setCreditEditValue(Math.max(0, parseInt(e.target.value) || 0))}
              className="mt-2"
              min={0}
              max={100000}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreditEditTarget(null)}
              disabled={creditSaving}
            >
              Cancel
            </Button>
            <Button onClick={() => setCreditConfirmOpen(true)} disabled={creditSaving}>
              Save Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={creditConfirmOpen}
        onOpenChange={(open) => !open && setCreditConfirmOpen(false)}
        title="Confirm Credit Adjustment"
        description={`Set ${creditEditTarget?.name ?? creditEditTarget?.email}'s credit balance to ${creditEditValue}? Current balance: ${creditEditTarget?.aiCredits ?? 0}.`}
        confirmLabel="Confirm"
        variant="warning"
        onConfirm={() => {
          setCreditConfirmOpen(false);
          handleCreditSave();
        }}
        loading={creditSaving}
      />
    </div>
  );
}
