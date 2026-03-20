import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Github } from "lucide-react";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Login",
};

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <Link
          href="/"
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 hover:scale-105"
        >
          <BookOpen className="h-6 w-6 text-primary" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t("welcomeBack")}</h1>
        <p className="text-sm text-muted-foreground">{t("signInDescription")}</p>
      </div>

      {/* OAuth buttons */}
      <div className="stagger-1 flex animate-slide-up flex-col gap-3">
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <Button type="submit" variant="outline" className="w-full gap-2.5 py-5 text-[13px]">
            <GoogleIcon />
            {t("continueWithGoogle")}
          </Button>
        </form>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <Button type="submit" variant="outline" className="w-full gap-2.5 py-5 text-[13px]">
            <Github className="h-4 w-4" />
            {t("continueWithGithub")}
          </Button>
        </form>
      </div>

      <p className="stagger-2 mt-8 animate-slide-up text-center text-xs text-muted-foreground">
        {t("termsAgreement")}{" "}
        <Link
          href="/terms"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          {t("termsOfService")}
        </Link>{" "}
        &{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          {t("privacyPolicy")}
        </Link>
        .
      </p>
    </div>
  );
}
