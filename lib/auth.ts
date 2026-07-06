import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any, // Cast to any to avoid type mismatch with customized User model
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { memberships: { include: { organization: true } } },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        const membership = user.memberships[0];
        const isPaid = membership ? (membership.organization.plan !== 'FREE' || !!membership.organization.stripeSubscriptionId) : false;
        
        return {
          id: String(user.id),
          email: user.email,
          orgId: membership ? String(membership.organizationId) : null,
          orgRole: membership ? membership.role : null,
          orgSlug: membership ? membership.organization.slug : null,
          isPaid,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.orgId = (user as any).orgId;
        token.orgRole = (user as any).orgRole;
        token.orgSlug = (user as any).orgSlug;
        token.isSuperAdmin = user.email === 'mustafayamin5@gmail.com';
        token.isPaid = (user as any).isPaid;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).orgId = token.orgId as string | null;
        (session.user as any).orgRole = token.orgRole as string | null;
        (session.user as any).orgSlug = token.orgSlug as string | null;
        (session.user as any).isSuperAdmin = token.isSuperAdmin as boolean;
        (session.user as any).isPaid = token.isPaid as boolean;
      }
      return session;
    },
  },
};
