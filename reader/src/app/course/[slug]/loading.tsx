import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_WIDTHS = [88, 72, 95, 80, 76, 91, 83, 70, 97, 85, 78, 92];

export default function ChapterLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-fade-in px-4 py-8 md:px-8">
      <Skeleton className="skeleton-shimmer mb-3 h-4 w-32" />
      <Skeleton className="skeleton-shimmer mb-4 h-10 w-3/4" />
      <Skeleton className="skeleton-shimmer mb-8 h-4 w-48" />
      <div className="space-y-3">
        {SKELETON_WIDTHS.map((width, i) => (
          <Skeleton
            key={i}
            className="skeleton-shimmer h-4"
            style={{ width: `${width}%`, animationDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
