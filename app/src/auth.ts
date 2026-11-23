import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { db } from "@/lib/db";

// Our Prisma schema uses camelCase field names with @map() for snake_case DB columns.
// Auth.js sends OAuth fields in snake_case (access_token, id_token, etc.) which
// doesn't match the Prisma model field names (accessToken, idToken, etc.).
// We override affected adapter methods to remap field names.

function accountToDb(data: Record<string, any>) {
  return {
    userId: data.userId,
    type: data.type,
    provider: data.provider,
    providerAccountId: data.providerAccountId,
    refreshToken: data.refresh_token ?? data.refreshToken ?? null,
    accessToken: data.access_token ?? data.accessToken ?? null,
    expiresAt: data.expires_at ?? data.expiresAt ?? null,
    tokenType: data.token_type ?? data.tokenType ?? null,
    scope: data.scope ?? null,
    idToken: data.id_token ?? data.idToken ?? null,
    sessionState: data.session_state ?? data.sessionState ?? null,
  };
}

function dbAccountToAuthJs(account: Record<string, any> | null) {
  if (!account) return null;
  return {
    ...account,
    access_token: account.accessToken,
    id_token: account.idToken,
    refresh_token: account.refreshToken,
    expires_at: account.expiresAt,
    token_type: account.tokenType,
    session_state: account.sessionState,
  };
}

const prismaAdapter = PrismaAdapter(db);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...prismaAdapter,
    linkAccount: (data: Record<string, any>) =>
      db.account.create({ data: accountToDb(data) }) as any,
    unlinkAccount: ({ provider, providerAccountId }: any) =>
      db.account.delete({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      }) as any,
    async getUserByAccount({ provider, providerAccountId }: any) {
      const account = await db.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      });
      return (account?.user as any) ?? null;
    },
    async getAccount(providerAccountId: string, provider: string) {
      const account = await db.account.findFirst({
        where: { providerAccountId, provider },
      });
      return dbAccountToAuthJs(account);
    },
  } as any,
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
      // Auth.js passes the database session and the whole user row. Return only what the app reads,
      // so /api/auth/session does not hand the session token or Stripe ids to client scripts.
      return {
        expires: session.expires,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role ?? "USER",
          plan: user.plan ?? "FREE",
          displayName: user.displayName ?? null,
          locale: user.locale ?? null,
          primaryLanguage: user.primaryLanguage ?? null,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
  },
});
