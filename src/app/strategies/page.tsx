"use client";

import { BarChartComponent } from "@/components/charts";
import { LineChartComponent } from "@/components/charts/LineChartComponent";
import { InsightBlock } from "@/components/ui";

const CAPITAL_DATA = [
  { name: "Jahr 1", value: 100 },
  { name: "Jahr 3", value: 118 },
  { name: "Jahr 5", value: 142 },
  { name: "Jahr 7", value: 168 },
  { name: "Jahr 10", value: 210 },
  { name: "Jahr 15", value: 295 },
  { name: "Jahr 20", value: 385 },
];

const TIMELINE = [
  { phase: "Akquise", duration: "0\u20133 Mon.", desc: "Marktanalyse, Due Diligence, Kaufverhandlung" },
  { phase: "Finanzierung", duration: "1\u20132 Mon.", desc: "Bankvergleich, Kreditvertrag, Notar" },
  { phase: "Optimierung", duration: "3\u201312 Mon.", desc: "Sanierung, Mietanpassung, Verwaltung" },
  { phase: "Stabilisierung", duration: "1\u20133 J.", desc: "Cashflow aufbauen, Tilgung, Steueroptimierung" },
  { phase: "Exit / Halten", duration: "10+ J.", desc: "Wiederverkauf oder langfristiger Bestand" },
];

export default function StrategiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Investmentstrategien</h1>
        <p className="section-subtitle mt-0.5">Bew\u00E4hrte Ans\u00E4tze f\u00FCr Immobilieninvestments in Deutschland.</p>
      </div>

      {/* Strategy cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <InsightBlock icon={"\uD83C\uDFD7\uFE0F"} title="Buy & Hold" value="Langfristig" subtitle="Stabiler Cashflow und steuerliche Vorteile \u00FCber 10+ Jahre." />
        <InsightBlock icon={"\uD83D\uDD27"} title="Value-Add" value="Mittelfristig" subtitle="Sanieren, Miete steigern und Objektwert erh\u00F6hen." />
        <InsightBlock icon={"\uD83D\uDCC8"} title="Flip" value="Kurzfristig" subtitle="Unter Marktwert kaufen, sanieren und mit Gewinn verkaufen." />
      </div>

      {/* Visual Timeline */}
      <div className="card p-6">
        <h3 className="section-title mb-5">Investment-Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
          <div className="space-y-6">
            {TIMELINE.map((t, i) => (
              <div key={t.phase} className="relative flex gap-5 pl-4">
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                  i === 0 ? "accent-gradient text-white" : "bg-white border-2 border-[var(--accent)] text-[var(--accent)]"
                }`}>
                  {i + 1}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold">{t.phase}</h4>
                    <span className="badge bg-[var(--accent-light)] text-[var(--accent)]">{t.duration}</span>
                  </div>
                  <p className="text-sm text-[var(--muted)] mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts side by side */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="section-title mb-4">Kapitalentwicklung (Index, Beispiel)</h3>
          <LineChartComponent data={CAPITAL_DATA} />
        </div>
        <div className="card p-6">
          <h3 className="section-title mb-4">Score nach Stadt (Beispieldaten)</h3>
          <BarChartComponent />
        </div>
      </div>
    </div>
  );
}
