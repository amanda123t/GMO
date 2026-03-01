import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-3">Erro de autenticação</h1>
        <p className="text-slate-400 mb-8">
          Ocorreu um problema ao entrar. O link pode ter expirado ou já ter sido usado.
        </p>
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
        >
          Tentar novamente
        </Link>
      </div>
    </div>
  );
}
