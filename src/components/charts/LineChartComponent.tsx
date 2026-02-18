"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

interface LineChartProps {
  data?: { name: string; value: number }[];
  height?: number;
}

const DEFAULT_DATA = [
  { name: "Jan", value: 62 },
  { name: "Feb", value: 65 },
  { name: "M\u00E4r", value: 63 },
  { name: "Apr", value: 68 },
  { name: "Mai", value: 72 },
  { name: "Jun", value: 71 },
  { name: "Jul", value: 75 },
];

export function LineChartComponent({ data = DEFAULT_DATA, height = 220 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.01} />
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
        />
        <Area
          type="monotone"
          dataKey="value"
          fill="url(#areaGradient)"
          stroke="none"
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="url(#lineGradient)"
          strokeWidth={2.5}
          dot={{ r: 3.5, fill: "#4F46E5", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 5, fill: "#4F46E5", strokeWidth: 2, stroke: "#fff" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
