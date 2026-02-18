"use client";

import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { C } from "@/lib/theme";

const FEATURES = [
  "Unbegrenzte Immobilien-Analysen",
  "Portfolio & Vergleichstools",
  "KI-gestützte Empfehlungen",
] as const;

export function Paywall() {
  return (
    <div className="mx-auto max-w-[480px] py-16 space-y-8">
      <div className="flex flex-col items-center gap-4">
        <AIOrb size={48} active />
        <h2 className="text-xl font-bold text-center" style={{ color: C.text }}>
          Ihre kostenlose Analyse wurde verwendet
        </h2>
        <p className="text-sm text-center leading-relaxed" style={{ color: C.sub }}>
          Schalten Sie alle Funktionen frei — unbegrenzte Analysen, Portfolio-Verwaltung,
          Vergleichstools und strategische Empfehlungen.
        </p>
      </div>

      <Card className="p-6 space-y-5" glow>
        {/* Price */}
        <div className="text-center space-y-1">
          <p className="text-3xl font-bold" style={{ color: C.text }}>
            15,99 € <span className="text-sm font-medium" style={{ color: C.sub }}>/ Monat</span>
          </p>
          <p className="text-xs" style={{ color: C.dim }}>
            Monatlich kündbar. Keine Mindestlaufzeit.
          </p>
        </div>

        {/* CTA */}
        <button
          className="w-full rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90"
          style={{
            background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
            color: "#fff",
          }}
        >
          Jetzt freischalten
        </button>

        {/* Feature bullets */}
        <ul className="space-y-3 pt-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0"
                style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}
              >
                &#10003;
              </span>
              <span className="text-sm" style={{ color: C.sub }}>{f}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
