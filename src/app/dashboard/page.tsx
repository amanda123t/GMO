import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Role, Prisma } from "@prisma/client";
import { DashboardShell } from "./_components/dashboard-shell";

function buildWhere(
  role: Role,
  tenantId: string | null,
  userId: string
): Prisma.WaveWhereInput {
  if (role === "SUPER_ADMIN") return {};
  if (role === "TENANT_ADMIN" || role === "FACILITATOR") {
    return { tenantId: tenantId ?? undefined };
  }
  // RESPONDENT: no aggregated dashboard — handled below
  return { assessments: { some: { userId } } };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // RESPONDENT does not access the aggregated dashboard
  if (session.user.role === "RESPONDENT") redirect("/");

  const { role, tenantId, id: userId } = session.user;

  const waves = await prisma.wave.findMany({
    where: buildWhere(role, tenantId, userId),
    select: {
      id: true,
      name: true,
      status: true,
      startDate: true,
      endDate: true,
      project: { select: { name: true } },
      tenant: { select: { name: true } },
      _count: { select: { assessments: true } },
      assessments: {
        where: { status: "COMPLETED" },
        select: { id: true },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const initialWaves = waves.map((w) => ({
    id: w.id,
    name: w.name,
    projectName: w.project.name,
    tenantName: w.tenant.name,
    status: w.status as string,
    startDate: w.startDate.toISOString(),
    endDate: w.endDate.toISOString(),
    totalCount: w._count.assessments,
    completedCount: w.assessments.length,
  }));

  return (
    <DashboardShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email,
        role: session.user.role,
      }}
      initialWaves={initialWaves}
      showTenant={role === "SUPER_ADMIN"}
    />
  );
}
