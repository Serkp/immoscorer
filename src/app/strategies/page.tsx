"use client";

import { BarChartComponent } from "@/components/charts";
import { InsightBlock } from "@/components/ui";

export default function StrategiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Investment Strategies</h1>
        <p className="text-sm text-[var(--muted)]">Common approaches for German real estate investments.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <InsightBlock icon="🏗️" title="Buy & Hold" value="Long-term" subtitle="Steady cash-flow, tax advantages over 10+ years." />
        <InsightBlock icon="🔧" title="Value-Add" value="Medium-term" subtitle="Renovate to increase rent and property value." />
        <InsightBlock icon="📈" title="Flip" value="Short-term" subtitle="Buy below market, renovate, sell for profit." />
      </div>

      <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6">
        <h3 className="font-semibold mb-4">Average Score by City (sample)</h3>
        <BarChartComponent />
      </div>
    </div>
  );
}
