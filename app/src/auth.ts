import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // next-auth v5 beta: adapter types diverge slightly from @auth/core — safe to cast

  adapter: PrismaAdapter(db) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role ?? "USER";
      session.user.plan = user.plan ?? "FREE";
      session.user.displayName = user.displayName ?? null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
