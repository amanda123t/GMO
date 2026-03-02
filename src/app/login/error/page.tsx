import Link from "next/link";

// NextAuth v5 appends ?error=<Code> to this page on any auth failure.
// Common codes and their meaning:
//   Configuration   → AUTH_SECRET not set or invalid in Netlify env vars
//   CredentialsSignin → wrong email/password (should not reach here with redirect:false)
//   AccessDenied    → user.isActive = false
//   Verification    → magic link expired or already used
//   Default         → unexpected server error (usually DB unreachable)

const ERROR_MESSAGES: Record<string, { title: string; hint: string }> = {
  Configuration: {
    title: "Configuração inválida",
    hint: 'AUTH_SECRET não está configurado nas variáveis de ambiente do Netlify. Vá em Site Settings → Environment variables e adicione AUTH_SECRET.',
  },
  AccessDenied: {
    title: "Acesso negado",
    hint: "Sua conta está inativa. Entre em contato com o administrador.",
  },
  Verification: {
    title: "Link expirado",
    hint: "O link de acesso expirou ou já foi utilizado. Solicite um novo.",
  },
  Default: {
    title: "Erro inesperado",
    hint: "Verifique se as variáveis de ambiente do banco de dados (DATABASE_URL / NETLIFY_DATABASE_URL) estão configuradas corretamente.",
  },
};

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const code = error ?? "Default";
  const info = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-3">{info.title}</h1>
        <p className="text-slate-400 mb-4">{info.hint}</p>
        <p className="text-slate-600 text-xs mb-6 font-mono">código: {code}</p>
        {code === "Configuration" && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-6 text-left">
            <p className="text-slate-300 text-sm font-semibold mb-2">
              Variáveis necessárias no Netlify:
            </p>
            <ul className="text-slate-400 text-xs space-y-1 font-mono">
              <li>
                AUTH_SECRET=
                <span className="text-slate-500">[openssl rand -base64 32]</span>
              </li>
              <li>
                AUTH_URL=
                <span className="text-slate-500">https://seu-app.netlify.app</span>
              </li>
            </ul>
          </div>
        )}
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
