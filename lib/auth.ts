import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        loginAs: { label: "Login As", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials.loginAs) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { roles: true },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        const hasRole = user.roles.some((r: { role: string }) => r.role === credentials.loginAs);
        const isAdmin = user.roles.some((r: { role: string }) => r.role === "ADMIN");

        if (!hasRole && !isAdmin) return null;

        return {
          id: String(user.id),
          email: user.email,
          roles: user.roles.map((r: { role: string }) => r.role),
          loginAs: credentials.loginAs as "ADMIN" | "CLIENT",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.roles = (user as any).roles || [];
        token.loginAs = (user as any).loginAs;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).roles = token.roles as string[];
        (session.user as any).loginAs = token.loginAs as "ADMIN" | "CLIENT";
      }
      return session;
    },
  },
};

