"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useSearchStore } from "@/stores/search-store";
import { cn } from "@/lib/utils/cn";
import { UserMenu } from "@/components/auth/user-menu";
import { CreditsBadge } from "@/components/ai/credits-badge";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface TopNavProps {
  onMenuClick: () => void;
  showLogo?: boolean;
  user?: {
    name?: string | null;
    displayName?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    plan?: string;
    primaryLanguage?: string | null;
  };
}

export function TopNav({ onMenuClick, user, showLogo }: TopNavProps) {
  const pathname = usePathname();
  const setSearchOpen = useSearchStore((s) => s.setOpen);

  const pageTitle = getPageTitle(pathname);

  return (
    <TooltipProvider delayDuration={0}>
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          {/* Mobile menu trigger */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Logo */}
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

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search (desktop) */}
            <Button
              variant="outline"
              size="sm"
              className="hidden h-8 gap-2 px-3 text-muted-foreground sm:flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
                ⌘K
              </kbd>
            </Button>

            {/* Search (mobile) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:hidden"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search</TooltipContent>
            </Tooltip>

            {/* Language + Theme side by side */}
            <LanguageSwitcher currentLanguage={user?.primaryLanguage ?? "en"} />
            <ThemeToggle />

            {/* Credits */}
            <CreditsBadge />

            {/* User menu */}
            {user && <UserMenu user={user} />}
          </div>
        </div>
      </header>
    </TooltipProvider>
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
    "/admin/credit-packs": "Credit Packs",
    "/admin/offers": "Offers",
  };
  return titles[pathname] ?? null;
}
