"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { navGroups, adminNavGroups, bottomNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";
import { BookOpen } from "lucide-react";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return (
    pathname === href ||
    (href !== "/" &&
      (pathname.startsWith(href) || (href === "/courses" && pathname.startsWith("/course/"))))
  );
}

export function MobileNav({ open, onOpenChange, isAdmin }: MobileNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");
  const isOnAdminPage = pathname.startsWith("/admin");
  const groups = isOnAdminPage && isAdmin ? adminNavGroups : navGroups;
  const resolveItemLabel =
    isOnAdminPage && isAdmin
      ? (key: string) => tAdmin(key as never)
      : (key: string) => t(key as never);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {tCommon("appName")}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto p-3">
          {groups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {t(group.label as never)}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isNavActive(pathname, item.href)
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {resolveItemLabel(item.label)}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t pt-2">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isNavActive(pathname, item.href)
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(item.label as never)}
              </Link>
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
