// Node.js-only auth config — includes Prisma adapter and Nodemailer.
// NOT imported by middleware (Edge incompatible). Use auth.config.ts for Edge.
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/nodemailer";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { z } from "zod";
import type { Role } from "@prisma/client";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // ── Credentials (email + password) — full DB lookup ───────────────────
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.isActive) return null;

        // NOTE: bcrypt password comparison goes here in the auth feature branch.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          tenantId: user.tenantId,
        };
      },
    }),

    // ── Magic Link (Nodemailer) — env-gated ───────────────────────────────
    ...(process.env.EMAIL_SERVER_HOST
      ? [
          Email({
            server: {
              host: process.env.EMAIL_SERVER_HOST,
              port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
              auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
              },
            },
            from: process.env.EMAIL_FROM,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = (user as { role: Role }).role;
        token.tenantId = (user as { tenantId: string | null }).tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: Role }).role = token.role as Role;
        (session.user as { tenantId: string | null }).tenantId =
          token.tenantId as string | null;
      }
      return session;
    },
  },
});
