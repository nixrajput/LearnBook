import { Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LeaderboardEntry {
  userId: string;
  name: string | null;
  image: string | null;
  chaptersCompleted: number;
  score: number;
}

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const medalColors = ["text-amber-500", "text-zinc-400", "text-amber-700"];

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        <Trophy className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold">Leaderboard</h3>
      </div>
      <div className="divide-y">
        {sorted.length === 0 && (
          <div className="px-5 py-6 text-center text-sm text-muted-foreground">No activity yet</div>
        )}
        {sorted.map((entry, i) => (
          <div key={entry.userId} className="flex items-center gap-3 px-5 py-3">
            <span
              className={`w-5 text-center text-sm font-bold ${i < 3 ? medalColors[i] : "text-muted-foreground"}`}
            >
              {i + 1}
            </span>
            <Avatar className="h-7 w-7">
              <AvatarImage src={entry.image ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {entry.name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{entry.name ?? "User"}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold tabular-nums">{entry.score}</div>
              <div className="text-[10px] text-muted-foreground">{entry.chaptersCompleted} ch</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
