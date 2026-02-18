"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data?: { name: string; value: number }[];
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

export function LineChartComponent({ data = DEFAULT_DATA }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RechartsLineChart data={data}>
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
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563EB"
          strokeWidth={2}
          dot={{ r: 3, fill: "#2563EB" }}
          activeDot={{ r: 5 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
