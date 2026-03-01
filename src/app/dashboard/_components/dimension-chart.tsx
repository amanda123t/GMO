"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface DimensionScore {
  dimensionId: string;
  code: string;
  name: string;
  colorHex: string | null;
  avgScore: number | null;
}

// Short labels for X-axis (fit without truncation)
const SHORT_LABEL: Record<string, string> = {
  SELF_AWARENESS: "Autoconsciência",
  SELF_MANAGEMENT: "Autogestão",
  MOTIVATION: "Motivação",
  EMPATHY: "Empatia",
  SOCIAL_SKILLS: "Hab. Sociais",
  ADAPTABILITY: "Adaptabilidade",
};

const DEFAULT_COLOR = "#6366f1";
const RISK_COLOR = "#f87171"; // red-400 — matches EM_RISCO band

interface TooltipPayload {
  name: string;
  score: number;
  hasData: boolean;
  isRisk: boolean;
}

interface Props {
  data: DimensionScore[];
  riskThreshold?: number; // default: 40
}

export function DimensionChart({ data, riskThreshold = 40 }: Props) {
  const chartData = data.map((d) => ({
    name: SHORT_LABEL[d.code] ?? d.name,
    score: d.avgScore ?? 0,
    color: d.colorHex ?? DEFAULT_COLOR,
    hasData: d.avgScore !== null,
    isRisk: d.avgScore !== null && d.avgScore <= riskThreshold,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

        {/* Risk threshold reference line */}
        <ReferenceLine
          y={riskThreshold}
          stroke="#ef4444"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
          label={{
            value: `Risco ≤${riskThreshold}`,
            position: "insideTopRight",
            fill: "#ef4444",
            fontSize: 10,
            opacity: 0.7,
          }}
        />

        <XAxis
          dataKey="name"
          tick={{ fill: "#94a3b8", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickCount={6}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as TooltipPayload;
            return (
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                <p className="text-slate-300 font-medium">{d.name}</p>
                {d.isRisk && (
                  <p className="text-red-400 text-xs mt-0.5">⚠ Zona de risco</p>
                )}
                <p className="text-white font-bold mt-0.5">
                  {d.hasData ? `${d.score} / 100` : "Sem dados"}
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              // Risk dimensions rendered in red regardless of dimension color
              fill={entry.isRisk ? RISK_COLOR : entry.color}
              fillOpacity={entry.hasData ? 1 : 0.25}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
