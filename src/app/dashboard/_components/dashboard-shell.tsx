"use client";

import { useState, useEffect, useCallback } from "react";
import { DimensionChart } from "./dimension-chart";
import { ProfileDistribution } from "./profile-distribution";
import type { DimensionScore } from "./dimension-chart";
import type { ProfileBandItem } from "./profile-distribution";
import type { Role } from "@prisma/client";

// ─── Types (mirror API response shapes) ──────────────────────────────────────

export interface WaveItem {
  id: string;
  name: string;
  projectName: string;
  tenantName: string;
  status: string;
  startDate: string;
  endDate: string;
  totalCount: number;
  completedCount: number;
}

interface WaveMetrics {
  waveId: string;
  waveName: string;
  projectName: string;
  tenantName: string;
  status: string;
  totalRespondents: number;
  completedRespondents: number;
  completionRate: number;
  eiIndex: number | null;
  dimensionScores: DimensionScore[];
  profileDistribution: ProfileBandItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativa",
  CLOSED: "Encerrada",
  ARCHIVED: "Arquivada",
};

const STATUS_PILL: Record<string, string> = {
  DRAFT: "bg-slate-700 text-slate-300",
  ACTIVE: "bg-emerald-900/60 text-emerald-300 border border-emerald-700/40",
  CLOSED: "bg-blue-900/60 text-blue-300 border border-blue-700/40",
  ARCHIVED: "bg-slate-800 text-slate-500",
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  TENANT_ADMIN: "Admin",
  FACILITATOR: "Facilitador",
  RESPONDENT: "Respondente",
};

const ROLE_PILL: Record<string, string> = {
  SUPER_ADMIN: "bg-violet-900/60 text-violet-300",
  TENANT_ADMIN: "bg-blue-900/60 text-blue-300",
  FACILITATOR: "bg-amber-900/60 text-amber-300",
  RESPONDENT: "bg-slate-700 text-slate-300",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  user: { name: string | null; email: string; role: Role };
  initialWaves: WaveItem[];
  showTenant: boolean; // true for SUPER_ADMIN
}

export function DashboardShell({ user, initialWaves, showTenant }: Props) {
  const [selectedWaveId, setSelectedWaveId] = useState<string>(
    initialWaves[0]?.id ?? ""
  );
  const [metrics, setMetrics] = useState<WaveMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (waveId: string) => {
    if (!waveId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/dashboard/waves/${waveId}/metrics`);
      if (!res.ok) {
        setFetchError("Não foi possível carregar os dados desta wave.");
        return;
      }
      const data: WaveMetrics = await res.json();
      setMetrics(data);
    } catch {
      setFetchError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (initialWaves[0]?.id) {
      fetchMetrics(initialWaves[0].id);
    }
    // fetchMetrics is stable; initialWaves doesn't change after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleWaveChange(waveId: string) {
    setSelectedWaveId(waveId);
    fetchMetrics(waveId);
  }

  const selectedWave = initialWaves.find((w) => w.id === selectedWaveId);
  const displayName = user.name ?? user.email;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Header ── */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold tracking-tight">
            IE
          </div>
          <span className="text-slate-400 text-sm font-medium">
            EI Assessment · GMO
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">{displayName}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              ROLE_PILL[user.role] ?? "bg-slate-700 text-slate-300"
            }`}
          >
            {ROLE_LABEL[user.role] ?? user.role}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ── Wave selector ── */}
        <section className="space-y-3">
          <h1 className="text-xl font-semibold">Dashboard por Wave</h1>
          {initialWaves.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">
              <p className="text-slate-400 text-sm">
                Nenhuma wave disponível para o seu perfil.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedWaveId}
                onChange={(e) => handleWaveChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[300px]"
              >
                {initialWaves.map((w) => (
                  <option key={w.id} value={w.id}>
                    {showTenant ? `${w.tenantName} · ` : ""}
                    {w.projectName} · {w.name}
                  </option>
                ))}
              </select>
              {selectedWave && (
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    STATUS_PILL[selectedWave.status] ??
                    "bg-slate-700 text-slate-300"
                  }`}
                >
                  {STATUS_LABEL[selectedWave.status] ?? selectedWave.status}
                </span>
              )}
            </div>
          )}
        </section>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Error ── */}
        {fetchError && !loading && (
          <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-red-300 text-sm">
            {fetchError}
          </div>
        )}

        {/* ── Metrics ── */}
        {metrics && !loading && (
          <>
            {/* Wave header */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">
                    {metrics.projectName}
                    {showTenant && (
                      <span className="ml-1 text-slate-600">
                        · {metrics.tenantName}
                      </span>
                    )}
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    {metrics.waveName}
                  </h2>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {metrics.totalRespondents}
                    </p>
                    <p className="text-slate-500 text-xs">respondentes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {metrics.completedRespondents}
                    </p>
                    <p className="text-slate-500 text-xs">concluídos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {metrics.completionRate}%
                    </p>
                    <p className="text-slate-500 text-xs">conclusão</p>
                  </div>
                </div>
              </div>
            </section>

            {/* EI Index card */}
            <section>
              <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-800/30 rounded-2xl px-8 py-7 flex items-center gap-8">
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">
                    Índice Geral de IE
                  </p>
                  {metrics.eiIndex !== null ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold text-white">
                        {metrics.eiIndex}
                      </span>
                      <span className="text-slate-500 text-lg">/ 100</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-slate-600">—</span>
                  )}
                  <p className="text-slate-500 text-xs mt-2">
                    {metrics.eiIndex !== null
                      ? "Média das 6 dimensões (scores persistidos)"
                      : "Scores ainda não computados para esta wave"}
                  </p>
                </div>
              </div>
            </section>

            {/* Charts — only rendered when there is score data */}
            {metrics.eiIndex !== null ? (
              <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Dimension chart — wider */}
                <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold mb-0.5">
                    Índice por Dimensão
                  </h3>
                  <p className="text-slate-500 text-xs mb-4">
                    Score médio por dimensão · escala 0–100
                  </p>
                  <DimensionChart data={metrics.dimensionScores} />
                </div>

                {/* Profile distribution — narrower */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold mb-0.5">
                    Distribuição de Perfis
                  </h3>
                  <p className="text-slate-500 text-xs mb-4">
                    Respondentes por faixa de score
                  </p>
                  <ProfileDistribution data={metrics.profileDistribution} />
                  {/* Legend */}
                  <div className="mt-4 space-y-1.5">
                    {metrics.profileDistribution.map((b) => (
                      <div
                        key={b.band}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-400">
                          {b.label}{" "}
                          <span className="text-slate-600">({b.range} pts)</span>
                        </span>
                        <span className="text-slate-300 font-medium">
                          {b.count} · {b.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <p className="text-slate-400 text-sm font-medium mb-1">
                  Gráficos indisponíveis
                </p>
                <p className="text-slate-600 text-xs">
                  Os scores são persistidos pelo engine de scoring após a
                  conclusão dos assessments.
                </p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
