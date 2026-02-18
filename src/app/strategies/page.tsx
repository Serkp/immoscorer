"use client";

import { Card } from "@/components/ui/Card";
import { C } from "@/lib/theme";

const STRATEGIES = [
  {
    title: "Buy & Hold",
    subtitle: "Langfristig \u00b7 10+ Jahre",
    desc: "Kaufen, vermieten, halten. Sie profitieren von Mieteinnahmen, Tilgung durch den Mieter und langfristiger Wertsteigerung. Die klassische Vermögensaufbau-Strategie.",
    profile: "Für: Berufstätige mit stabilem Einkommen, die passiv Vermögen aufbauen möchten.",
    returns: "Gesamtrendite: 8–12 % p.a. (Cashflow + Tilgung + Wertsteigerung)",
    icon: (
      <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    title: "Value-Add",
    subtitle: "Mittelfristig \u00b7 3–7 Jahre",
    desc: "Unterbewertete Objekte kaufen, gezielt sanieren, Miete steigern. Sie schaffen aktiv Mehrwert durch Optimierung. Höheres Renditepotenzial bei mehr Aufwand.",
    profile: "Für: Erfahrene Investoren mit Sanierungs-Know-how und Kapitalreserven.",
    returns: "Gesamtrendite: 12–20 % p.a. (inkl. Wertsteigerung durch Sanierung)",
    icon: (
      <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: "Flip",
    subtitle: "Kurzfristig \u00b7 6–18 Monate",
    desc: "Unter Marktwert kaufen, schnell sanieren, mit Gewinn verkaufen. Hoher Kapitaleinsatz, hohe Rendite, aber auch hohes Risiko. Erfordert Marktkenntnis und schnelle Umsetzung.",
    profile: "Für: Vollzeit-Investoren mit Netzwerk (Handwerker, Makler) und hoher Risikobereitschaft.",
    returns: "Gewinnmarge: 15–30 % pro Projekt",
    icon: (
      <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
] as const;

const TIMELINE = [
  { phase: "Akquise", time: "0–3 Monate", desc: "Marktanalyse, Objektsuche, Due Diligence. Prüfen Sie Score, Rendite und Risiken mit ImmoScorer." },
  { phase: "Finanzierung", time: "1–2 Monate", desc: "Bankgespräche, Kreditvergleich, Notartermin. Streben Sie 80 % LTV und Sondertilgungsoptionen an." },
  { phase: "Optimierung", time: "3–12 Monate", desc: "Sanierungen durchführen, Mietanpassung nach §558 BGB, Nebenkostenoptimierung." },
  { phase: "Stabilisierung", time: "1–3 Jahre", desc: "Cashflow aufbauen, Tilgung laufen lassen, Rücklagen bilden. Monitoring über Ihr ImmoScorer Portfolio." },
  { phase: "Exit oder Halten", time: "10+ Jahre", desc: "Verkauf nach Spekulationsfrist (10 Jahre steuerfrei) oder Bestandsaufbau für passives Einkommen." },
] as const;

export default function StrategiesPage() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Investment-Strategien</h1>
        <p className="text-sm mt-1" style={{ color: C.sub }}>
          Finden Sie die Strategie, die zu Ihrem Anlageprofil passt.
        </p>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STRATEGIES.map((s) => (
          <Card key={s.title} className="p-5 space-y-4" hover>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: C.accentDim }}>
              {s.icon}
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: C.text }}>{s.title}</h3>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: C.accent }}>{s.subtitle}</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: C.sub }}>{s.desc}</p>
            <div className="rounded-xl p-3" style={{ background: C.surface }}>
              <p className="text-[11px] leading-relaxed" style={{ color: C.dim }}>{s.profile}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: C.greenDim, border: `1px solid ${C.greenBorder}` }}>
              <p className="text-[11px] font-semibold" style={{ color: C.green }}>{s.returns}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold">Der typische Ablauf einer Immobilien-Investition</h2>
        </div>

        <div className="relative pl-8">
          {/* Vertical line */}
          <div
            className="absolute left-3 top-2 bottom-2 w-px"
            style={{ background: `linear-gradient(180deg, ${C.accent}, ${C.cyan})` }}
          />

          <div className="space-y-6">
            {TIMELINE.map((step, i) => (
              <div key={i} className="relative">
                {/* Dot */}
                <div
                  className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border-2"
                  style={{
                    borderColor: C.accent,
                    background: C.bg,
                  }}
                />
                <Card className="p-4 space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold" style={{ color: C.text }}>{step.phase}</h3>
                    <span className="text-[10px] font-medium rounded-full px-2 py-0.5" style={{ background: C.surface3, color: C.dim }}>
                      {step.time}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: C.sub }}>{step.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
