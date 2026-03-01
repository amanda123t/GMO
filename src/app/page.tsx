import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-sm">
            EI
          </div>
          <span className="font-semibold text-lg">GMO Assessment</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded-lg"
        >
          Entrar
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-700/50 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Plataforma Multi-tenant · Versionamento de Questionário · Waves
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
          Assessment de
          <br />
          Inteligência Emocional
          <br />
          <span className="text-blue-400">na Gestão da Mudança</span>
        </h1>

        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12">
          Meça, acompanhe e desenvolva as competências emocionais que impulsionam
          transformações organizacionais bem-sucedidas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold px-8 py-3 rounded-xl text-lg"
          >
            Começar Assessment
          </Link>
          <a
            href="#dimensoes"
            className="border border-slate-600 hover:border-slate-500 transition-colors text-slate-300 font-semibold px-8 py-3 rounded-xl text-lg"
          >
            Ver Dimensões de IE
          </a>
        </div>
      </section>

      {/* Dimensions */}
      <section
        id="dimensoes"
        className="max-w-7xl mx-auto px-8 pb-32"
      >
        <h2 className="text-3xl font-bold text-center mb-4">
          Dimensões Avaliadas
        </h2>
        <p className="text-slate-400 text-center mb-12">
          Baseado no modelo de Goleman aplicado ao contexto de mudança organizacional
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIMENSIONS.map((dim) => (
            <div
              key={dim.name}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-700/50 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-xl"
                style={{ backgroundColor: dim.color + "33" }}
              >
                {dim.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{dim.name}</h3>
              <p className="text-slate-400 text-sm">{dim.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} GMO EI Assessment. Todos os direitos reservados.
      </footer>
    </main>
  );
}

const DIMENSIONS = [
  {
    name: "Autoconsciência",
    icon: "🪞",
    color: "#60a5fa",
    description:
      "Reconhecer as próprias emoções e como elas influenciam decisões durante processos de mudança.",
  },
  {
    name: "Autogestão",
    icon: "⚖️",
    color: "#34d399",
    description:
      "Gerenciar impulsos e adaptar comportamentos frente à incerteza e resistências organizacionais.",
  },
  {
    name: "Motivação",
    icon: "🎯",
    color: "#f59e0b",
    description:
      "Manter engajamento e orientação a resultados mesmo diante de desafios da transformação.",
  },
  {
    name: "Empatia",
    icon: "🤝",
    color: "#a78bfa",
    description:
      "Compreender as perspectivas e reações emocionais dos stakeholders impactados pela mudança.",
  },
  {
    name: "Habilidades Sociais",
    icon: "🌐",
    color: "#fb7185",
    description:
      "Comunicar, influenciar e construir alianças para sustentar a adoção da mudança.",
  },
  {
    name: "Resiliência à Mudança",
    icon: "🛡️",
    color: "#38bdf8",
    description:
      "Capacidade de recuperação e adaptação contínua frente às pressões do ambiente em transformação.",
  },
];
