import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── EI Framework ─────────────────────────────────────────────────────────────
// Framework Proprietário GMO — IE aplicada à Execução de Mudança Organizacional
// 6 dimensões oficiais, construídas sobre a intersecção entre Inteligência
// Emocional e capacidade de absorção de mudança (Change Readiness/Execution).
// ─────────────────────────────────────────────────────────────────────────────

const DIMENSIONS = [
  {
    code: "SELF_AWARENESS",
    name: "Autoconsciência",
    description:
      "Capacidade de reconhecer as próprias emoções, forças, limitações e valores e como eles influenciam o comportamento durante processos de mudança organizacional. Inclui a habilidade de identificar sinais internos e compreender seu impacto nas decisões e nas relações profissionais.",
    order: 1,
    colorHex: "#60a5fa",
    questions: [
      "Consigo identificar claramente o que estou sentindo durante situações de mudança organizacional.",
      "Percebo como minhas emoções afetam minhas decisões e meu comportamento profissional.",
      "Reconheço meus pontos fortes e limitações ao enfrentar processos de transformação.",
    ],
  },
  {
    code: "SELF_MANAGEMENT",
    name: "Autogestão",
    description:
      "Capacidade de regular as próprias emoções, impulsos e comportamentos, especialmente em contextos de alta pressão e ambiguidade. Envolve manter o foco, a integridade e a orientação a resultados mesmo diante de resistências e incertezas do processo de mudança.",
    order: 2,
    colorHex: "#34d399",
    questions: [
      "Mantenho a calma e a objetividade mesmo diante de incertezas do processo de mudança.",
      "Adapto meu comportamento de acordo com as demandas da situação sem perder minha essência.",
      "Gerencio minhas reações emocionais antes de tomar decisões importantes em contextos de transformação.",
    ],
  },
  {
    code: "MOTIVATION",
    name: "Motivação",
    description:
      "Tendência emocional de buscar objetivos com energia e persistência, movida por valores intrínsecos e senso de propósito, não apenas por recompensas externas. No contexto de Gestão da Mudança, manifesta-se como engajamento sustentado mesmo diante de obstáculos e reversões.",
    order: 3,
    colorHex: "#f59e0b",
    questions: [
      "Mantenho o entusiasmo e o foco nos objetivos mesmo quando enfrento resistências organizacionais.",
      "Encontro sentido e propósito nas iniciativas de transformação organizacional.",
      "Persevero diante de obstáculos sem perder o engajamento com a mudança.",
    ],
  },
  {
    code: "EMPATHY",
    name: "Empatia",
    description:
      "Capacidade de compreender as perspectivas, sentimentos e preocupações dos outros, especialmente dos stakeholders impactados por decisões de mudança. Vai além da simpatia: inclui a habilidade de perceber reações não verbalizadas e adaptar a comunicação ao estado emocional do interlocutor.",
    order: 4,
    colorHex: "#a78bfa",
    questions: [
      "Consigo compreender as preocupações e resistências das pessoas impactadas pela mudança.",
      "Adapto minha comunicação levando em conta as emoções e o contexto dos stakeholders.",
      "Percebo o impacto emocional que as decisões de mudança geram nas equipes, mesmo quando não expresso verbalmente.",
    ],
  },
  {
    code: "SOCIAL_SKILLS",
    name: "Habilidades Sociais",
    description:
      "Competências relacionais que permitem influenciar, comunicar e construir redes de apoio para sustentar iniciativas de transformação. Inclui gestão de conflitos, liderança de equipes, construção de alianças e capacidade de criar narrativas convincentes sobre o futuro almejado.",
    order: 5,
    colorHex: "#fb7185",
    questions: [
      "Construo alianças e redes de apoio para sustentar a implementação da mudança.",
      "Comunico de forma clara e convincente a visão e os benefícios da transformação organizacional.",
      "Gerencio conflitos de maneira construtiva durante o processo de mudança.",
    ],
  },
  {
    code: "ADAPTABILITY",
    name: "Adaptabilidade",
    description:
      "Capacidade de ajustar emoções, cognições e comportamentos em resposta a novas demandas, ambiguidades e rupturas organizacionais. Dimensão central do framework GMO como preditor de absorção efetiva de mudança. Diferencia-se de Autogestão por focar na flexibilidade sistêmica diante do contexto externo, não apenas no controle de impulsos internos.",
    order: 6,
    colorHex: "#38bdf8",
    questions: [
      "Ajusto minha abordagem rapidamente quando as condições do projeto de mudança se alteram de forma inesperada.",
      "Encaro ambiguidades e incertezas do processo de transformação como oportunidades de aprendizado e crescimento.",
      "Mantenho a efetividade e o equilíbrio ao lidar com múltiplas prioridades simultâneas em contextos de alta mudança.",
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database — EI-GMO v1.0...");

  // ── Demo Tenant ───────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Organization",
      slug: "demo",
      isActive: true,
    },
  });

  console.log(`✅ Tenant: ${tenant.name} (id: ${tenant.id})`);

  // ── Demo Project ──────────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { id: "demo-project-001" },
    update: {},
    create: {
      id: "demo-project-001",
      tenantId: tenant.id,
      name: "Transformação Digital 2026",
      description: "Projeto de diagnóstico de IE para a iniciativa de transformação digital.",
      status: "ACTIVE",
    },
  });

  console.log(`✅ Project: ${project.name} (id: ${project.id})`);

  // ── Demo Areas ────────────────────────────────────────────────────────────
  const areaNames = [
    { id: "demo-area-001", name: "Tecnologia", description: "Times de engenharia e produto" },
    { id: "demo-area-002", name: "Operações", description: "Times de operações e logística" },
    { id: "demo-area-003", name: "Pessoas & Cultura", description: "RH, desenvolvimento e cultura organizacional" },
  ];

  for (const area of areaNames) {
    await prisma.area.upsert({
      where: { id: area.id },
      update: {},
      create: { ...area, projectId: project.id },
    });
  }

  console.log(`✅ Areas: ${areaNames.map((a) => a.name).join(", ")}`);

  // ── Questionnaire Version v1 ──────────────────────────────────────────────
  const qv = await prisma.questionnaireVersion.upsert({
    where: { version: 1 },
    update: {},
    create: {
      version: 1,
      name: "EI-GMO v1.0",
      description:
        "Assessment de IE aplicada à Execução de Mudança Organizacional — " +
        "Framework proprietário GMO. " +
        "6 dimensões: SELF_AWARENESS | SELF_MANAGEMENT | MOTIVATION | EMPATHY | SOCIAL_SKILLS | ADAPTABILITY",
      isActive: true,
      publishedAt: new Date(),
    },
  });

  console.log(`✅ QuestionnaireVersion: ${qv.name} (id: ${qv.id})`);

  // ── Dimensions + Questions + Options ──────────────────────────────────────
  for (const dim of DIMENSIONS) {
    const { questions, ...dimData } = dim;

    const dimension = await prisma.dimension.upsert({
      where: {
        questionnaireVersionId_code: {
          questionnaireVersionId: qv.id,
          code: dimData.code,
        },
      },
      update: {},
      create: {
        questionnaireVersionId: qv.id,
        weight: 1.0,
        ...dimData,
      },
    });

    for (let i = 0; i < questions.length; i++) {
      const question = await prisma.question.upsert({
        where: {
          dimensionId_order: {
            dimensionId: dimension.id,
            order: i + 1,
          },
        },
        update: {},
        create: {
          dimensionId: dimension.id,
          text: questions[i],
          order: i + 1,
          type: "LIKERT_5",
          isReversed: false,
        },
      });

      const likert5Options = [
        { label: "Discordo Totalmente", value: 1 },
        { label: "Discordo Parcialmente", value: 2 },
        { label: "Nem Concordo Nem Discordo", value: 3 },
        { label: "Concordo Parcialmente", value: 4 },
        { label: "Concordo Totalmente", value: 5 },
      ];

      for (let j = 0; j < likert5Options.length; j++) {
        await prisma.questionOption.upsert({
          where: {
            questionId_order: {
              questionId: question.id,
              order: j + 1,
            },
          },
          update: {},
          create: {
            questionId: question.id,
            label: likert5Options[j].label,
            value: likert5Options[j].value,
            order: j + 1,
          },
        });
      }
    }

    console.log(
      `  ✅ [${dimData.code}] ${dimData.name} — ${questions.length} perguntas`
    );
  }

  // ── Demo Wave ─────────────────────────────────────────────────────────────
  const wave = await prisma.wave.upsert({
    where: { id: "demo-wave-001" },
    update: {},
    create: {
      id: "demo-wave-001",
      tenantId: tenant.id,
      projectId: project.id,
      questionnaireVersionId: qv.id,
      name: "Wave 1 – Diagnóstico Inicial Q1/2026",
      description: "Primeira onda de avaliação de IE para o projeto de transformação digital.",
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-31"),
      status: "ACTIVE",
      allowAnonymous: false,
    },
  });

  console.log(`✅ Wave: ${wave.name} (id: ${wave.id})`);

  console.log("\n🎉 Seed concluído — 6 dimensões, 18 perguntas, 90 opções.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
