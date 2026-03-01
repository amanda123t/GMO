// Wave metrics API — returns pre-persisted Score data, no recalculation in UI.
// Access control: SUPER_ADMIN (all), TENANT_ADMIN/FACILITATOR (own tenant),
// RESPONDENT (blocked at dashboard page level; 403 here as safety net).
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Profile bands ────────────────────────────────────────────────────────────
// Asymmetric: high end requires genuinely high scores (Referência is rare).
type ProfileBand = "EM_RISCO" | "EM_DESENVOLVIMENTO" | "EM_AVANCO" | "REFERENCIA";

function scoreBand(avg: number): ProfileBand {
  if (avg <= 40) return "EM_RISCO";
  if (avg <= 70) return "EM_DESENVOLVIMENTO";
  if (avg <= 85) return "EM_AVANCO";
  return "REFERENCIA";
}

// Dimensions with avg ≤ this threshold are flagged as at-risk
const RISK_THRESHOLD = 40;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ waveId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role, tenantId } = session.user;

  // RESPONDENT does not access aggregated dashboard
  if (role === "RESPONDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { waveId } = await params;

  const wave = await prisma.wave.findUnique({
    where: { id: waveId },
    select: {
      id: true,
      name: true,
      status: true,
      tenantId: true,
      project: { select: { name: true } },
      tenant: { select: { name: true } },
    },
  });

  if (!wave) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Tenant-scope check for non-SUPER_ADMIN
  if (role !== "SUPER_ADMIN" && wave.tenantId !== tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch dimensions for this wave's questionnaire version
  const dimensions = await prisma.dimension.findMany({
    where: { questionnaireVersion: { waves: { some: { id: waveId } } } },
    select: { id: true, code: true, name: true, colorHex: true, order: true },
    orderBy: { order: "asc" },
  });

  // Read persisted scores — never recalculate here
  const scores = await prisma.score.findMany({
    where: { assessment: { waveId } },
    select: { dimensionId: true, normalizedScore: true, assessmentId: true },
  });

  // Per-dimension average of normalizedScore (already 0–100 from scoring engine)
  const dimensionScores = dimensions.map((dim) => {
    const dimScores = scores.filter((s) => s.dimensionId === dim.id);
    const avg =
      dimScores.length > 0
        ? dimScores.reduce((sum, s) => sum + s.normalizedScore, 0) /
          dimScores.length
        : null;
    return {
      dimensionId: dim.id,
      code: dim.code,
      name: dim.name,
      colorHex: dim.colorHex,
      avgScore: avg !== null ? Math.round(avg * 10) / 10 : null,
    };
  });

  // Índice de Capacidade de Adoção = mean of dimension averages (equal weights)
  const validAvgs = dimensionScores
    .map((d) => d.avgScore)
    .filter((s): s is number => s !== null);
  const adoptionIndex =
    validAvgs.length > 0
      ? Math.round(
          (validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length) * 10
        ) / 10
      : null;

  // Dimensions flagged as at-risk (avg ≤ RISK_THRESHOLD)
  const riskDimensions = dimensionScores
    .filter((d) => d.avgScore !== null && d.avgScore <= RISK_THRESHOLD)
    .map((d) => ({ code: d.code, name: d.name, avgScore: d.avgScore as number }));

  // Profile distribution: per-assessment avg → asymmetric band
  const assessmentIds = [...new Set(scores.map((s) => s.assessmentId))];
  const bandCounts: Record<ProfileBand, number> = {
    EM_RISCO: 0,
    EM_DESENVOLVIMENTO: 0,
    EM_AVANCO: 0,
    REFERENCIA: 0,
  };
  for (const aId of assessmentIds) {
    const aScores = scores.filter((s) => s.assessmentId === aId);
    if (aScores.length === 0) continue;
    const avg =
      aScores.reduce((sum, s) => sum + s.normalizedScore, 0) / aScores.length;
    bandCounts[scoreBand(avg)]++;
  }
  const totalWithScores = assessmentIds.length;

  const profileDistribution = [
    {
      band: "EM_RISCO" as const,
      label: "Em Risco",
      range: "0–40",
      count: bandCounts.EM_RISCO,
      percentage:
        totalWithScores > 0
          ? Math.round((bandCounts.EM_RISCO / totalWithScores) * 100)
          : 0,
    },
    {
      band: "EM_DESENVOLVIMENTO" as const,
      label: "Em Desenvolvimento",
      range: "41–70",
      count: bandCounts.EM_DESENVOLVIMENTO,
      percentage:
        totalWithScores > 0
          ? Math.round((bandCounts.EM_DESENVOLVIMENTO / totalWithScores) * 100)
          : 0,
    },
    {
      band: "EM_AVANCO" as const,
      label: "Em Avanço",
      range: "71–85",
      count: bandCounts.EM_AVANCO,
      percentage:
        totalWithScores > 0
          ? Math.round((bandCounts.EM_AVANCO / totalWithScores) * 100)
          : 0,
    },
    {
      band: "REFERENCIA" as const,
      label: "Referência",
      range: "86–100",
      count: bandCounts.REFERENCIA,
      percentage:
        totalWithScores > 0
          ? Math.round((bandCounts.REFERENCIA / totalWithScores) * 100)
          : 0,
    },
  ];

  const [totalRespondents, completedRespondents] = await Promise.all([
    prisma.assessment.count({ where: { waveId } }),
    prisma.assessment.count({ where: { waveId, status: "COMPLETED" } }),
  ]);

  return NextResponse.json({
    waveId: wave.id,
    waveName: wave.name,
    projectName: wave.project.name,
    tenantName: wave.tenant.name,
    status: wave.status,
    totalRespondents,
    completedRespondents,
    completionRate:
      totalRespondents > 0
        ? Math.round((completedRespondents / totalRespondents) * 100)
        : 0,
    adoptionIndex,   // renamed from eiIndex — "Índice de Capacidade de Adoção"
    riskDimensions,  // dimensions with avgScore ≤ 40
    dimensionScores,
    profileDistribution,
  });
}
