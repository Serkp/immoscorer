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
}

const DEFAULT_DATA = [
  { name: "Berlin", value: 72 },
  { name: "M\u00FCnchen", value: 65 },
  { name: "Hamburg", value: 78 },
  { name: "Frankfurt", value: 81 },
  { name: "K\u00F6ln", value: 69 },
];

export function BarChartComponent({ data = DEFAULT_DATA }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RechartsBarChart data={data} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: "0.75rem",
            fontSize: "0.75rem",
          }}
        />
        <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
