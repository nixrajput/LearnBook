import { FileText, Globe, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FORMAT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  markdown: {
    label: "MD",
    icon: FileText,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  pdf: {
    label: "PDF",
    icon: FileText,
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  epub: {
    label: "EPUB",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  web: {
    label: "WEB",
    icon: Globe,
    color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  },
};

export function FormatBadge({ sourceType }: { sourceType: string }) {
  const config = FORMAT_CONFIG[sourceType] ?? FORMAT_CONFIG.markdown;
  const Icon = config.icon;

  return (
    <Badge className={`gap-1 text-[10px] ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
