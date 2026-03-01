"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

// Short labels for X-axis
const SHORT_LABEL: Record<string, string> = {
  SELF_AWARENESS: "Autoconsciência",
  SELF_MANAGEMENT: "Autogestão",
  MOTIVATION: "Motivação",
  EMPATHY: "Empatia",
  SOCIAL_SKILLS: "Hab. Sociais",
  ADAPTABILITY: "Adaptabilidade",
};

const DEFAULT_COLOR = "#6366f1";

interface TooltipPayload {
  name: string;
  score: number;
  color: string;
  hasData: boolean;
}

export function DimensionChart({ data }: { data: DimensionScore[] }) {
  const chartData = data.map((d) => ({
    name: SHORT_LABEL[d.code] ?? d.name,
    score: d.avgScore ?? 0,
    color: d.colorHex ?? DEFAULT_COLOR,
    hasData: d.avgScore !== null,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
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
              fill={entry.color}
              fillOpacity={entry.hasData ? 1 : 0.25}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
