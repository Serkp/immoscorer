"use client";

import { BarChartComponent } from "@/components/charts";
import { InsightBlock } from "@/components/ui";

export default function StrategiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Investmentstrategien</h1>
        <p className="text-sm text-[var(--muted)]">Bew\u00E4hrte Ans\u00E4tze f\u00FCr Immobilieninvestments in Deutschland.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <InsightBlock icon={"\uD83C\uDFD7\uFE0F"} title="Buy & Hold" value="Langfristig" subtitle="Stabiler Cashflow und steuerliche Vorteile \u00FCber 10+ Jahre." />
        <InsightBlock icon={"\uD83D\uDD27"} title="Value-Add" value="Mittelfristig" subtitle="Sanieren, Miete steigern und Objektwert erh\u00F6hen." />
        <InsightBlock icon={"\uD83D\uDCC8"} title="Flip" value="Kurzfristig" subtitle="Unter Marktwert kaufen, sanieren und mit Gewinn verkaufen." />
      </div>

      <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6">
        <h3 className="font-semibold mb-4">Durchschnittlicher Score nach Stadt (Beispieldaten)</h3>
        <BarChartComponent />
      </div>
    </div>
  );
}
