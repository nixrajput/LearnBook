"use client";

import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
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
        mounted.current
          ? theme === "system"
            ? `System (${resolvedTheme})`
            : (theme ?? undefined)
          : undefined
      }
    >
      {mounted.current && theme === "light" && <Sun className="h-4 w-4" />}
      {mounted.current && theme === "dark" && <Moon className="h-4 w-4" />}
      {(!mounted.current || theme === "system") && <Monitor className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
