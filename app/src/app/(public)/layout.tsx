import Link from "next/link";
import { cookies } from "next/headers";
import { BookOpen } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { AppShell } from "@/components/layout/app-shell";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const cookieStore = await cookies();
  const currentLang = cookieStore.get("locale")?.value ?? "en";

  if (isLoggedIn) {
    return (
      <AppShell user={session.user} hideSidebar>
        {children}
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold transition-colors hover:text-primary"
          >
            <BookOpen className="h-5 w-5 text-primary" />
            <span>LearnBook</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <LanguageSwitcher currentLanguage={currentLang} persistToDb={false} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>
  );
}
