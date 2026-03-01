// Node.js-only auth config — includes Prisma adapter and Nodemailer.
// NOT imported by middleware (Edge incompatible). Use auth.config.ts for Edge.
//
// TODO(next-auth-beta): next-auth@5.0.0-beta is used in this project.
// The API is stable enough for current usage but should be upgraded to the
// stable release once available (track: https://github.com/nextauthjs/next-auth/releases).
// Migration plan:
//   1. Watch for stable 5.x release (no breaking changes expected vs current beta).
//   2. Update package.json version constraint from "^5.0.0-beta.X" to "^5.x".
//   3. Run full regression on: Credentials login, Magic Link, JWT callbacks, session.
//   4. If a breaking beta is released before stable, pin to current beta version first.
// Auth is isolated in src/lib/auth.ts + src/lib/auth.config.ts — all changes here.
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/nodemailer";
import bcrypt from "bcryptjs";
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

        let user: {
          id: string;
          email: string;
          name: string | null;
          image: string | null;
          password: string | null;
          isActive: boolean;
          role: Role;
          tenantId: string | null;
        } | null;

        try {
          user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true,
              isActive: true,
              role: true,
              tenantId: true,
            },
          });
        } catch {
          // DB error — do not surface details to the client
          return null;
        }

        if (!user || !user.isActive || !user.password) return null;

        let passwordValid: boolean;
        try {
          passwordValid = await bcrypt.compare(parsed.data.password, user.password);
        } catch {
          // bcrypt error — do not surface details to the client
          return null;
        }

        if (!passwordValid) return null;

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
