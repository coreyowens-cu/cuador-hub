import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_DOMAIN = "curadorbrands.com";
const ALLOWED_EMAILS = ["seanmatw@gmail.com"];

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) return false;

      const email = profile.email.toLowerCase();
      const domain = email.split("@")[1];

      if (domain !== ALLOWED_DOMAIN && !ALLOWED_EMAILS.includes(email)) {
        return false;
      }

      // Auto-create user on first login
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length === 0) {
        await db.insert(users).values({
          name: (profile.name as string) ?? email.split("@")[0],
          email,
          googleSub: profile.sub as string,
          role: "member",
          active: true,
        });
      } else if (
        existingUser[0] &&
        (!existingUser[0].active || existingUser[0].deletedAt)
      ) {
        return false; // Block deactivated or deleted users
      } else if (existingUser[0] && !existingUser[0].googleSub) {
        await db
          .update(users)
          .set({ googleSub: profile.sub as string })
          .where(eq(users.email, email));
      }

      return true;
    },

    async session({ session }) {
      if (!session.user?.email) return session;

      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);

      if (dbUser[0]) {
        session.user.id = dbUser[0].id;
        session.user.role = dbUser[0].role;
        session.user.marketingRole = dbUser[0].marketingRole;
      }

      return session;
    },

    async jwt({ token, profile }) {
      if (profile?.email) {
        token.email = profile.email;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
