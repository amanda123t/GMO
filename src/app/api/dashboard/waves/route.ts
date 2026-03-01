import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role, Prisma } from "@prisma/client";

function buildWhere(
  role: Role,
  tenantId: string | null,
  userId: string
): Prisma.WaveWhereInput {
  if (role === "SUPER_ADMIN") return {};
  if (role === "TENANT_ADMIN" || role === "FACILITATOR") {
    return { tenantId: tenantId ?? undefined };
  }
  // RESPONDENT — blocked at dashboard page level; this is a safety net
  return { assessments: { some: { userId } } };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role, tenantId, id: userId } = session.user;

  try {
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

    return NextResponse.json(
      waves.map((w) => ({
        id: w.id,
        name: w.name,
        projectName: w.project.name,
        tenantName: w.tenant.name,
        status: w.status,
        startDate: w.startDate.toISOString(),
        endDate: w.endDate.toISOString(),
        totalCount: w._count.assessments,
        completedCount: w.assessments.length,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
