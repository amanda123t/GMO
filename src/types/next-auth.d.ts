import type { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  // Extend only Session.user — role and tenantId are injected via the jwt
  // callback, never expected from the database adapter (AdapterUser).
  // Extending the User interface would conflict with @auth/prisma-adapter types.
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      tenantId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    tenantId: string | null;
  }
}
