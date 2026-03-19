import type { DefaultSession } from "next-auth";
import type { AdapterUser } from "@auth/core/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      plan: string;
      displayName: string | null;
      locale: string | null;
      primaryLanguage: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    plan: string;
    displayName: string | null;
    locale: string | null;
    primaryLanguage: string | null;
  }
}

// Augment AdapterUser so the session() callback's `user` param carries all custom fields
declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: string;
    plan: string;
    displayName: string | null;
    locale: string | null;
    primaryLanguage: string | null;
  }
}
