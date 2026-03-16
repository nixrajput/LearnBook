"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, Moon, Sun, Monitor, BookOpen } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/stores/search-store";
import { navItems } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const setSearchOpen = useSearchStore((s) => s.setOpen);
  const mountedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full animate-slide-down border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Mobile menu trigger */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">LearnBook</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                pathname === item.href ||
                  (item.href !== "/" &&
                    (pathname.startsWith(item.href) ||
                      (item.href === "/courses" && pathname.startsWith("/course/"))))
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 text-muted-foreground sm:flex"
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

        {/* Theme toggle: light → dark → system → light */}
        <Button
          variant="ghost"
          size="icon"
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
