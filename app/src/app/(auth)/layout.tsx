import { cookies } from "next/headers";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const currentLang = cookieStore.get("locale")?.value ?? "en";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      {/* Language + Theme toggle */}
      <div className="absolute right-4 top-4 flex items-center gap-1">
        <LanguageSwitcher currentLanguage={currentLang} persistToDb={false} />
        <ThemeToggle />
      </div>

      {children}
    </div>
  );
}
