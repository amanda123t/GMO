/**
 * seed-admin.ts — Usuários de teste para validação local do Dashboard
 *
 * Cria 3 usuários com roles diferentes, sem vínculo de tenant fixo exceto
 * TENANT_ADMIN e FACILITATOR (vinculados ao tenant "Demo GMO" do seed-dashboard).
 *
 * ┌──────────────────────────────┬─────────────────┬─────────────┐
 * │ E-mail                       │ Senha           │ Role        │
 * ├──────────────────────────────┼─────────────────┼─────────────┤
 * │ superadmin@gmo.dev           │ gmo@2025        │ SUPER_ADMIN │
 * │ admin@demo.gmo               │ gmo@2025        │ TENANT_ADMIN│
 * │ facilitador@demo.gmo         │ gmo@2025        │ FACILITATOR │
 * └──────────────────────────────┴─────────────────┴─────────────┘
 *
 * SUPER_ADMIN vê todas as waves de todos os tenants.
 * TENANT_ADMIN e FACILITATOR vêem apenas a wave do tenant "Demo GMO".
 *
 * Idempotente: usa upsert — pode ser re-executado sem duplicar dados.
 * Requer: seed.ts + seed-dashboard.ts já executados.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "gmo@2025";

async function main() {
  console.log("🔐 Criando usuários de teste...\n");

  const hash = await bcrypt.hash(PASSWORD, 10);

  // Busca o tenant criado pelo seed-dashboard para vincular TENANT_ADMIN e FACILITATOR
  const demoTenant = await prisma.tenant.findFirst({
    where: { slug: "demo-gmo" },
    select: { id: true, name: true },
  });

  if (!demoTenant) {
    console.error(
      "❌ Tenant 'demo-gmo' não encontrado.\n" +
      "   Execute primeiro: npm run db:seed:dashboard"
    );
    process.exit(1);
  }

  const users = [
    {
      email: "superadmin@gmo.dev",
      name: "Super Admin",
      role: "SUPER_ADMIN" as const,
      tenantId: null,
    },
    {
      email: "admin@demo.gmo",
      name: "Admin Demo",
      role: "TENANT_ADMIN" as const,
      tenantId: demoTenant.id,
    },
    {
      email: "facilitador@demo.gmo",
      name: "Facilitador Demo",
      role: "FACILITATOR" as const,
      tenantId: demoTenant.id,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hash, isActive: true, role: u.role, tenantId: u.tenantId },
      create: {
        email: u.email,
        name: u.name,
        password: hash,
        role: u.role,
        tenantId: u.tenantId,
        isActive: true,
      },
    });
    console.log(`  ✅  ${u.email}  [${u.role}]`);
  }

  console.log(`
╔══════════════════════════════════════════════════════════╗
║              CREDENCIAIS PARA TESTE LOCAL                ║
╠══════════════════════════════════════════════════════════╣
║  URL:  http://localhost:3000/auth/signin                 ║
╠══════════════════════════════════════════════════════════╣
║  superadmin@gmo.dev    │  gmo@2025  │  SUPER_ADMIN       ║
║  admin@demo.gmo        │  gmo@2025  │  TENANT_ADMIN      ║
║  facilitador@demo.gmo  │  gmo@2025  │  FACILITATOR       ║
╚══════════════════════════════════════════════════════════╝
`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
