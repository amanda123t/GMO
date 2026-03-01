import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Questionnaire Version v1 ──────────────────────────────────────────────
  const qv = await prisma.questionnaireVersion.upsert({
    where: { version: 1 },
    update: {},
    create: {
      version: 1,
      name: "EI-GMO v1.0",
      description:
        "Primeira versão do Assessment de Inteligência Emocional para Gestão da Mudança",
      isActive: true,
      publishedAt: new Date(),
    },
  });

  console.log("✅ QuestionnaireVersion:", qv.name);

  // ── Dimensions ────────────────────────────────────────────────────────────
  const dimensionsData = [
    {
      name: "Autoconsciência",
      description: "Reconhecer as próprias emoções e seu impacto",
      order: 1,
      weight: 1.0,
      colorHex: "#60a5fa",
    },
    {
      name: "Autogestão",
      description: "Gerenciar impulsos e adaptar comportamentos",
      order: 2,
      weight: 1.0,
      colorHex: "#34d399",
    },
    {
      name: "Motivação",
      description: "Manter engajamento frente a desafios",
      order: 3,
      weight: 1.0,
      colorHex: "#f59e0b",
    },
    {
      name: "Empatia",
      description: "Compreender perspectivas e reações dos stakeholders",
      order: 4,
      weight: 1.0,
      colorHex: "#a78bfa",
    },
    {
      name: "Habilidades Sociais",
      description: "Comunicar, influenciar e construir alianças",
      order: 5,
      weight: 1.0,
      colorHex: "#fb7185",
    },
    {
      name: "Resiliência à Mudança",
      description: "Recuperação e adaptação contínua",
      order: 6,
      weight: 1.0,
      colorHex: "#38bdf8",
    },
  ];

  for (const dim of dimensionsData) {
    const dimension = await prisma.dimension.upsert({
      where: {
        questionnaireVersionId_order: {
          questionnaireVersionId: qv.id,
          order: dim.order,
        },
      },
      update: {},
      create: {
        questionnaireVersionId: qv.id,
        ...dim,
      },
    });

    // Sample questions per dimension (3 each for seed)
    const questions = SAMPLE_QUESTIONS[dim.name] ?? [];
    for (let i = 0; i < questions.length; i++) {
      const q = await prisma.question.upsert({
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
        },
      });

      // LIKERT_5 options
      const options = [
        { label: "Discordo Totalmente", value: 1 },
        { label: "Discordo", value: 2 },
        { label: "Neutro", value: 3 },
        { label: "Concordo", value: 4 },
        { label: "Concordo Totalmente", value: 5 },
      ];

      for (let j = 0; j < options.length; j++) {
        await prisma.questionOption.upsert({
          where: {
            questionId_order: {
              questionId: q.id,
              order: j + 1,
            },
          },
          update: {},
          create: {
            questionId: q.id,
            label: options[j].label,
            value: options[j].value,
            order: j + 1,
          },
        });
      }
    }

    console.log(`  ✅ Dimension seeded: ${dim.name} (${questions.length} questions)`);
  }

  console.log("\n🎉 Seed completed!");
}

const SAMPLE_QUESTIONS: Record<string, string[]> = {
  Autoconsciência: [
    "Consigo identificar claramente o que estou sentindo durante situações de mudança organizacional.",
    "Percebo como minhas emoções afetam minhas decisões profissionais.",
    "Reconheço meus pontos fortes e limitações no contexto de transformações.",
  ],
  Autogestão: [
    "Mantenho a calma e a objetividade mesmo diante de incertezas do processo de mudança.",
    "Adapto meu comportamento de acordo com as demandas da situação sem perder minha essência.",
    "Gerencio minhas reações emocionais antes de tomar decisões importantes.",
  ],
  Motivação: [
    "Mantenho o entusiasmo e o foco nos objetivos mesmo quando enfrento resistências.",
    "Encontro sentido e propósito nas iniciativas de transformação organizacional.",
    "Persevero diante de obstáculos sem perder o engajamento com a mudança.",
  ],
  Empatia: [
    "Consigo compreender as preocupações e resistências das pessoas impactadas pela mudança.",
    "Adapto minha comunicação levando em conta as emoções dos stakeholders.",
    "Percebo o impacto emocional que as decisões de mudança geram nas equipes.",
  ],
  "Habilidades Sociais": [
    "Construo alianças e redes de apoio para sustentar a implementação da mudança.",
    "Comunico de forma clara e convincente a visão e os benefícios da transformação.",
    "Gerencio conflitos de maneira construtiva durante o processo de mudança.",
  ],
  "Resiliência à Mudança": [
    "Recupero-me rapidamente de reveses e fracassos ocorridos durante processos de transformação.",
    "Mantenho a produtividade e o equilíbrio mesmo em ambientes de alta pressão e incerteza.",
    "Encaro as mudanças como oportunidades de aprendizado e crescimento profissional.",
  ],
};

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
