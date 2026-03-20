"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, Moon, Sun, Monitor, BookOpen } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/stores/search-store";
import { cn } from "@/lib/utils/cn";
import { UserMenu } from "@/components/auth/user-menu";
import { CreditsBadge } from "@/components/ai/credits-badge";

interface TopNavProps {
  onMenuClick: () => void;
  /** Show logo in top bar (when sidebar is hidden) */
  showLogo?: boolean;
  user?: {
    name?: string | null;
    displayName?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    plan?: string;
  };
}

export function TopNav({ onMenuClick, user, showLogo }: TopNavProps) {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const setSearchOpen = useSearchStore((s) => s.setOpen);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Derive page title from pathname
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 border-b px-4">
        {/* Mobile menu trigger */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo — always on mobile, on desktop only when sidebar is hidden */}
        <Link
          href="/dashboard"
          className={cn(
            "flex shrink-0 items-center gap-2 font-semibold transition-colors hover:text-primary",
            !showLogo && "md:hidden",
          )}
        >
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm">LearnBook</span>
        </Link>

        {/* Page title (desktop only) */}
        {pageTitle && <h1 className="hidden text-sm font-medium md:block">{pageTitle}</h1>}

        <div className="flex-1" />

        {/* Search */}
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:shadow-sm sm:flex"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
          <kbd className="pointer-events-none ml-1 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
            ⌘K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Credits + User menu */}
        {user && <CreditsBadge />}
        {user && <UserMenu user={user} />}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="transition-all duration-200 hover:bg-accent"
          onClick={() => {
            if (theme === "light") setTheme("dark");
            else if (theme === "dark") setTheme("system");
            else setTheme("light");
          }}
          title={mounted ? (theme === "system" ? `System (${resolvedTheme})` : theme) : undefined}
        >
          {mounted && theme === "light" && <Sun className="h-4 w-4" />}
          {mounted && theme === "dark" && <Moon className="h-4 w-4" />}
          {(!mounted || theme === "system") && <Monitor className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}

function getPageTitle(pathname: string): string | null {
  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/courses": "Courses",
    "/library": "Library",
    "/notes": "Notes",
    "/bookmarks": "Bookmarks",
    "/flashcards": "Flashcards",
    "/groups": "Study Groups",
    "/knowledge": "Knowledge Graph",
    "/credits": "AI Credits",
    "/settings": "Settings",
    "/profile": "Profile",
    "/admin": "Admin Overview",
    "/admin/analytics": "Analytics",
    "/admin/users": "Users",
    "/admin/courses": "Courses",
    "/admin/plans": "Plans",
    "/admin/offers": "Offers",
  };
  return titles[pathname] ?? null;
}
