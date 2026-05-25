import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/** Comma-separated allowlist of admin Google emails. */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allowed emails may log in.
      return isAdminEmail(user.email);
    },
    async jwt({ token }) {
      if (isAdminEmail(token.email)) {
        token.role = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role =
          (token.role as string) ?? undefined;
      }
      return session;
    },
  },
};
