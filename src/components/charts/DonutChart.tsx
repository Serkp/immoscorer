"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  data?: { name: string; value: number; color: string }[];
}

const DEFAULT_DATA = [
  { name: "Hervorragend", value: 4, color: "#16A34A" },
  { name: "Gut", value: 6, color: "#2563EB" },
  { name: "Durchschnittlich", value: 3, color: "#F59E0B" },
  { name: "Schwach", value: 1, color: "#EF4444" },
];

export function DonutChart({ data = DEFAULT_DATA }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
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
            border: "1px solid #E2E8F0",
            borderRadius: "0.75rem",
            fontSize: "0.75rem",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
