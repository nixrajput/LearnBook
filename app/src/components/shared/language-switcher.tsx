"use client";

import { useState, useCallback } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_LANGUAGES } from "@/config/locales";
import { cn } from "@/lib/utils/cn";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
}

interface LanguageSwitcherProps {
  currentLanguage: string;
  /** If true, persist to user DB. False for unauthenticated pages. */
  persistToDb?: boolean;
}

export function LanguageSwitcher({ currentLanguage, persistToDb = true }: LanguageSwitcherProps) {
  const [selected, setSelected] = useState(currentLanguage);

  const handleChange = useCallback(
    async (lang: string) => {
      if (lang === selected) return;
      setSelected(lang);

      // Persist to DB if authenticated
      if (persistToDb) {
        try {
          await fetch("/api/user/locale", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ primaryLanguage: lang }),
          });
        } catch {
          // Not critical
        }
      }

      // Set cookie and reload to apply translations
      setCookie("locale", lang);
      window.location.reload();
    },
    [selected, persistToDb],
  );

  if (SUPPORTED_LANGUAGES.length <= 1) return null;

  const currentShort = SUPPORTED_LANGUAGES.find((l) => l.code === selected)?.short ?? "EN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-muted-foreground">
          <Globe className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{currentShort}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={cn(selected === lang.code && "font-medium text-primary")}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
