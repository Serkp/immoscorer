"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  data?: { name: string; value: number; color: string }[];
  innerLabel?: string;
  innerValue?: string;
}

const DEFAULT_DATA = [
  { name: "Hervorragend", value: 4, color: "#4F46E5" },
  { name: "Gut", value: 6, color: "#6366F1" },
  { name: "Durchschnittlich", value: 3, color: "#A78BFA" },
  { name: "Schwach", value: 1, color: "#C4B5FD" },
];

export function DonutChart({ data = DEFAULT_DATA, innerLabel, innerValue }: DonutChartProps) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "0.75rem",
              fontSize: "0.8rem",
              boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
              padding: "8px 14px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(innerLabel || innerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {innerValue && <span className="text-2xl font-extrabold tracking-tight text-[var(--fg)]">{innerValue}</span>}
          {innerLabel && <span className="text-xs text-[var(--muted)] font-medium">{innerLabel}</span>}
        </div>
      )}
    </div>
  );
}
