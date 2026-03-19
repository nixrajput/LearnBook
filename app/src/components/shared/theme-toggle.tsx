"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
      }}
      title={
        mounted
          ? theme === "system"
            ? `System (${resolvedTheme})`
            : (theme ?? undefined)
          : undefined
      }
    >
      {mounted && theme === "light" && <Sun className="h-4 w-4" />}
      {mounted && theme === "dark" && <Moon className="h-4 w-4" />}
      {(!mounted || theme === "system") && <Monitor className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
