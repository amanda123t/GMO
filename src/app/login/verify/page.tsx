import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">📬</div>
        <h1 className="text-2xl font-bold text-white mb-3">Verifique seu e-mail</h1>
        <p className="text-slate-400 mb-8">
          Enviamos um link de acesso para o seu e-mail. Clique no link para entrar.
        </p>
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 text-sm underline"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
