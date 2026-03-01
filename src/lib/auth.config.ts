// Edge-compatible auth config — NO database adapter, NO nodemailer.
// Imported by middleware (Edge Runtime). Credentials are validated
// against the full DB in auth.ts (Node.js only).
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login/error",
  },
  providers: [
    // Credentials provider stub for Edge — actual DB lookup happens in auth.ts.
    // authorize() returning null here is safe: it only runs in the JWT strategy
    // and the full authorize() in auth.ts takes precedence at sign-in time.
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        return parsed.success ? { email: parsed.data.email } : null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname.startsWith("/login");
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
      const isPublic = nextUrl.pathname === "/" || isAuthRoute || isApiAuth;

      if (isLoggedIn && isAuthRoute) return Response.redirect(new URL("/dashboard", nextUrl));
      if (!isLoggedIn && !isPublic) return Response.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
      return true;
    },
  },
};
