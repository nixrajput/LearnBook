"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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

/** Map pathname → i18n key (namespace.key) */
const PAGE_TITLE_KEYS: Record<string, [string, string]> = {
  "/dashboard": ["nav", "dashboard"],
  "/courses": ["nav", "courses"],
  "/library": ["nav", "library"],
  "/notes": ["nav", "notes"],
  "/bookmarks": ["nav", "bookmarks"],
  "/flashcards": ["nav", "flashcards"],
  "/groups": ["nav", "groups"],
  "/knowledge": ["nav", "knowledge"],
  "/credits": ["nav", "aiCredits"],
  "/settings": ["nav", "settings"],
  "/profile": ["nav", "profile"],
  "/admin": ["admin", "overview"],
  "/admin/analytics": ["admin", "analytics"],
  "/admin/users": ["admin", "users"],
  "/admin/courses": ["admin", "courses"],
  "/admin/plans": ["admin", "plans"],
  "/admin/credit-packs": ["nav", "creditPacks"],
  "/admin/offers": ["admin", "offers"],
};

export function TopNav({ onMenuClick, user, showLogo }: TopNavProps) {
  const pathname = usePathname();
  const setSearchOpen = useSearchStore((s) => s.setOpen);
  const tNav = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");

  const titleEntry = PAGE_TITLE_KEYS[pathname];
  const pageTitle = titleEntry
    ? titleEntry[0] === "admin"
      ? tAdmin(titleEntry[1] as never)
      : tNav(titleEntry[1] as never)
    : null;

  return (
    <TooltipProvider delayDuration={0}>
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          {/* Mobile menu trigger */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">{tNav("toggleMenu")}</span>
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
            <span className="text-sm">{tCommon("appName")}</span>
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
              <span className="text-xs">{tNav("search")}</span>
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
              <TooltipContent>{tNav("search")}</TooltipContent>
            </Tooltip>

            {/* Credits */}
            <CreditsBadge />

            {/* Language + Theme side by side */}
            <LanguageSwitcher currentLanguage={user?.primaryLanguage ?? "en"} />
            <ThemeToggle />

            {/* User menu */}
            {user && <UserMenu user={user} />}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
