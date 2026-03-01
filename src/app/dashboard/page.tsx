import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Bem-vindo(a), {session.user.name ?? session.user.email}
        </p>
        <div className="mt-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <p className="text-slate-400 text-sm">
            O dashboard completo será implementado na próxima etapa.
          </p>
        </div>
      </div>
    </div>
  );
}
