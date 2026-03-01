import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-bold">
              EI
            </div>
            <span className="text-white font-semibold text-xl">GMO Assessment</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Bem-vindo(a) de volta</h1>
          <p className="mt-2 text-slate-400 text-sm">
            Entre para acessar seu assessment
          </p>
        </div>

        {/* Form card — Suspense required for useSearchParams() in Next.js 15 */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-xl">
          <Suspense fallback={<div className="h-40 animate-pulse bg-slate-700/50 rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
