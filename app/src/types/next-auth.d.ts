import type { DefaultSession } from "next-auth";
import type { AdapterUser } from "@auth/core/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      plan: string;
      displayName: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    plan: string;
    displayName: string | null;
  }
}

// Augment AdapterUser so the session() callback's `user` param carries role & plan
declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: string;
    plan: string;
    displayName: string | null;
  }
}
