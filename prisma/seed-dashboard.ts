/**
 * seed-dashboard.ts — Dados de validação para o Dashboard MVP (Etapa 2)
 *
 * Cria:
 *   • 1 Tenant demo
 *   • 1 Project demo
 *   • 1 Wave ACTIVE (vinculada ao QuestionnaireVersion v1 do seed principal)
 *   • 22 usuários RESPONDENT
 *   • 22 Assessments COMPLETED
 *   • 132 Score records (6 dimensões × 22 assessments)
 *
 * Distribuição de perfis (por design):
 *   • 7  Em Desenvolvimento  — avg normalizedScore  15–35
 *   • 8  Em Avanço           — avg normalizedScore  45–65
 *   • 7  Alto Potencial      — avg normalizedScore  72–88
 *
 * Idempotente via upsert onde possível.
 * Requer que `prisma/seed.ts` já tenha sido executado (QuestionnaireVersion v1).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Score profiles ───────────────────────────────────────────────────────────
// Each profile entry = [avg, spread] for the 6 dimensions.
// spread: per-dimension variance ±spread around avg (clamped 0–100).

const PROFILES: Array<{ avg: number; spread: number; count: number }> = [
  { avg: 22, spread: 8, count: 4 },  // Em Desenvolvimento (low)
  { avg: 34, spread: 6, count: 3 },  // Em Desenvolvimento (mid-low)
  { avg: 48, spread: 10, count: 4 }, // Em Avanço (low-mid)
  { avg: 58, spread: 8, count: 4 },  // Em Avanço (mid)
  { avg: 74, spread: 9, count: 4 },  // Alto Potencial (low-high)
  { avg: 84, spread: 7, count: 3 },  // Alto Potencial (high)
];

// Deterministic pseudo-random (no Math.random for reproducibility)
function dimScore(avg: number, spread: number, dimIndex: number, userIndex: number): number {
  // Simple deterministic variation: sine wave across dimensions × prime offset per user
  const variation = Math.sin((dimIndex * 2.3 + userIndex * 1.7)) * spread;
  return Math.min(100, Math.max(0, Math.round(avg + variation)));
}

// rawScore: reverse-engineer from normalizedScore (3-question LIKERT-5 per dim)
// normalizedScore = (rawScore - 3) / 12 * 100  →  rawScore = normalizedScore * 12 / 100 + 3
function toRawScore(normalizedScore: number): number {
  return Math.round((normalizedScore * 12) / 100 + 3);
}

async function main() {
  console.log("🌱 seed-dashboard — iniciando...\n");

  // ── 1. QuestionnaireVersion v1 (must exist — run seed.ts first) ──────────────
  const qv = await prisma.questionnaireVersion.findUnique({ where: { version: 1 } });
  if (!qv) {
    throw new Error(
      "QuestionnaireVersion v1 não encontrada.\n" +
      "Execute primeiro: npm run db:seed"
    );
  }
  console.log(`✅ QuestionnaireVersion: ${qv.name}`);

  // ── 2. Dimensions ──────────────────────────────────────────────────────────
  const dimensions = await prisma.dimension.findMany({
    where: { questionnaireVersionId: qv.id },
    orderBy: { order: "asc" },
    select: { id: true, code: true, name: true },
  });
  if (dimensions.length !== 6) {
    throw new Error(`Esperado 6 dimensões, encontrado ${dimensions.length}. Re-execute seed.ts.`);
  }
  console.log(`✅ Dimensões: ${dimensions.map((d) => d.code).join(", ")}\n`);

  // ── 3. Tenant ──────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-corp" },
    update: {},
    create: {
      name: "Demo Corp",
      slug: "demo-corp",
      isActive: true,
      settings: {},
    },
  });
  console.log(`✅ Tenant: ${tenant.name} (${tenant.id})`);

  // ── 4. Project ─────────────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { id: "seed-project-demo" },
    update: {},
    create: {
      id: "seed-project-demo",
      tenantId: tenant.id,
      name: "Transformação Digital 2026",
      description: "Projeto piloto para validação do Dashboard MVP.",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Project: ${project.name} (${project.id})`);

  // ── 5. Wave ACTIVE ─────────────────────────────────────────────────────────
  const wave = await prisma.wave.upsert({
    where: { id: "seed-wave-demo-q1" },
    update: { status: "ACTIVE" },
    create: {
      id: "seed-wave-demo-q1",
      tenantId: tenant.id,
      projectId: project.id,
      questionnaireVersionId: qv.id,
      name: "Wave 1 — Diagnóstico Q1/2026",
      description: "Wave de validação do Dashboard MVP.",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-03-31"),
      status: "ACTIVE",
      allowAnonymous: false,
    },
  });
  console.log(`✅ Wave: ${wave.name} [${wave.status}] (${wave.id})\n`);

  // ── 6. Respondents + Assessments + Scores ──────────────────────────────────
  const passwordHash = await bcrypt.hash("demo-password-123", 10);
  let userCounter = 0;

  for (const profile of PROFILES) {
    for (let p = 0; p < profile.count; p++) {
      userCounter++;
      const email = `respondente${String(userCounter).padStart(2, "0")}@demo-corp.com`;

      // User
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: `Respondente ${String(userCounter).padStart(2, "0")}`,
          password: passwordHash,
          role: "RESPONDENT",
          tenantId: tenant.id,
          isActive: true,
        },
        select: { id: true, email: true },
      });

      const respondentKey = `${wave.id}_${user.id}`;

      // Assessment
      const assessment = await prisma.assessment.upsert({
        where: { respondentKey },
        update: { status: "COMPLETED" },
        create: {
          tenantId: tenant.id,
          waveId: wave.id,
          userId: user.id,
          respondentKey,
          status: "COMPLETED",
          startedAt: new Date("2026-02-01"),
          completedAt: new Date("2026-02-15"),
        },
        select: { id: true },
      });

      // Scores — one per dimension
      for (let di = 0; di < dimensions.length; di++) {
        const dim = dimensions[di];
        const normalized = dimScore(profile.avg, profile.spread, di, userCounter);
        const raw = toRawScore(normalized);

        await prisma.score.upsert({
          where: { assessmentId_dimensionId: { assessmentId: assessment.id, dimensionId: dim.id } },
          update: { normalizedScore: normalized, rawScore: raw },
          create: {
            assessmentId: assessment.id,
            dimensionId: dim.id,
            rawScore: raw,
            normalizedScore: normalized,
            cohortScope: "WAVE",
          },
        });
      }

      // Summary for this respondent
      const dimScores = dimensions.map((dim, di) =>
        dimScore(profile.avg, profile.spread, di, userCounter)
      );
      const avgScore = Math.round(dimScores.reduce((a, b) => a + b, 0) / dimScores.length);
      console.log(`  👤 ${user.email}  avg=${avgScore}  [${dimScores.join(", ")}]`);
    }
    console.log();
  }

  // ── 7. Summary ─────────────────────────────────────────────────────────────
  const [totalAssessments, totalScores] = await Promise.all([
    prisma.assessment.count({ where: { waveId: wave.id } }),
    prisma.score.count({ where: { assessment: { waveId: wave.id } } }),
  ]);

  console.log("─".repeat(60));
  console.log(`✅ Assessments: ${totalAssessments}`);
  console.log(`✅ Scores:      ${totalScores} (${totalAssessments} × 6 dimensões)`);
  console.log(`\n🎉 seed-dashboard concluído!`);
  console.log(`\nWave ID para o Dashboard: ${wave.id}`);
  console.log(`URL:  /dashboard  →  selecione "Demo Corp · Transformação Digital 2026 · Wave 1"\n`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
