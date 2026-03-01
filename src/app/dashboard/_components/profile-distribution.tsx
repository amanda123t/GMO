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

export interface ProfileBandItem {
  band: string;
  label: string;
  range: string;
  count: number;
  percentage: number;
}

const BAND_COLOR: Record<string, string> = {
  EM_DESENVOLVIMENTO: "#f87171",
  EM_AVANCO: "#fbbf24",
  ALTO_POTENCIAL: "#34d399",
};

interface TooltipPayload {
  label: string;
  range: string;
  count: number;
  percentage: number;
}

export function ProfileDistribution({ data }: { data: ProfileBandItem[] }) {
  const chartData = data.map((d) => ({
    name: d.label,
    count: d.count,
    percentage: d.percentage,
    range: d.range,
    color: BAND_COLOR[d.band] ?? "#6366f1",
    label: d.label,
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
          tickFormatter={(v: string) => (v.length > 10 ? v.slice(0, 10) + "…" : v)}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as TooltipPayload;
            return (
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                <p className="text-slate-300 font-medium">{d.label}</p>
                <p className="text-slate-500 text-xs">{d.range} pts</p>
                <p className="text-white font-bold mt-1">
                  {d.count} respondente{d.count !== 1 ? "s" : ""}{" "}
                  <span className="text-slate-400 font-normal">({d.percentage}%)</span>
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
