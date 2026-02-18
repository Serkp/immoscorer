"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data?: { name: string; value: number }[];
  height?: number;
}

const DEFAULT_DATA = [
  { name: "Berlin", value: 72 },
  { name: "M\u00FCnchen", value: 65 },
  { name: "Hamburg", value: 78 },
  { name: "Frankfurt", value: 81 },
  { name: "K\u00F6ln", value: 69 },
];

export function BarChartComponent({ data = DEFAULT_DATA, height = 220 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} barSize={32}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          dx={-4}
        />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "0.75rem",
            fontSize: "0.8rem",
            boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
            padding: "8px 14px",
          }}
          cursor={{ fill: "rgb(79 70 229 / 0.04)" }}
        />
        <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
